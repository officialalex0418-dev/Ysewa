import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { randomBytes } from "crypto";
import { prisma } from "@yatrasewa/database";
import { env } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { httpError } from "../../middlewares/error-handler.js";
import type { Role } from "@yatrasewa/shared-types";
import { authenticator } from "otplib";
import type { TokenResponse } from "@yatrasewa/shared-types";

const OTP_TTL_SECONDS = 300; // 5 minutes
const OTP_MAX_SENDS_PER_WINDOW = 3;
const OTP_WINDOW_SECONDS = 900; // 15 minutes

interface JwtPayload {
  userId: string;
  role: Role;
  operatorId: string | null;
  counterId: string | null;
}

function signAccessToken(p: JwtPayload) {
  return jwt.sign(p, env.jwtAccessSecret, { expiresIn: `${env.jwtAccessTtlMinutes}m` });
}

function signRefreshToken(p: JwtPayload) {
  return jwt.sign(p, env.jwtRefreshSecret, { expiresIn: `${env.jwtRefreshTtlDays}d` });
}

function buildTokens(user: { id: string; role: Role; operatorId: string | null; counterId: string | null; is2faEnabled: boolean; fullName: string; phone: string | null; email: string | null }): TokenResponse {
  const payload: JwtPayload = { userId: user.id, role: user.role, operatorId: user.operatorId, counterId: user.counterId };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  return {
    accessToken,
    refreshToken,
    expiresIn: env.jwtAccessTtlMinutes * 60,
    user: {
      id: user.id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      operatorId: user.operatorId,
      counterId: user.counterId,
      is2faEnabled: user.is2faEnabled,
      requires2fa: false,
    },
  };
}

/** Hash a refresh token before storing */
function hashToken(t: string) {
  return argon2.hash(t);
}

async function verifyHash(hash: string, plain: string) {
  try { return await argon2.verify(hash, plain); } catch { return false; }
}

export async function loginWithPassword(phoneOrEmail: string, password: string): Promise<TokenResponse> {
  const user = await prisma.user.findFirst({
    where: { OR: [{ phone: phoneOrEmail }, { email: phoneOrEmail }], isActive: true },
  });
  if (!user || !user.passwordHash) throw httpError(401, "Invalid credentials");
  const ok = await argon2.verify(user.passwordHash, password);
  if (!ok) throw httpError(401, "Invalid credentials");
  return buildTokens(user);
}

export async function registerUser(data: { fullName: string; email?: string; phone?: string; password?: string }): Promise<TokenResponse> {
  if (data.email) {
    const existing = await prisma.user.findFirst({ where: { email: data.email } });
    if (existing) throw httpError(409, "User with this email already exists");
  }
  if (data.phone) {
    const existing = await prisma.user.findFirst({ where: { phone: data.phone } });
    if (existing) throw httpError(409, "User with this phone already exists");
  }

  let passwordHash: string | undefined = undefined;
  if (data.password) {
    passwordHash = await argon2.hash(data.password);
  }

  const user = await prisma.user.create({
    data: {
      fullName: data.fullName,
      email: data.email || null,
      phone: data.phone || null,
      passwordHash: passwordHash || null,
      role: "CUSTOMER",
    },
  });

  return buildTokens(user);
}

export async function sendOtp(phone: string, _purpose: string): Promise<{ sent: boolean; devOtp?: string }> {
  // Rate limit
  const rateKey = `otp:rate:${phone}`;
  const sent = await redis.incr(rateKey);
  if (sent === 1) await redis.expire(rateKey, OTP_WINDOW_SECONDS);
  if (sent > OTP_MAX_SENDS_PER_WINDOW) throw httpError(429, "Too many OTPs requested. Try again later.");

  // Generate 6-digit OTP
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  const key = `otp:${phone}`;
  await redis.set(key, otp, "EX", OTP_TTL_SECONDS);

  // Send SMS via Sparrow (best effort; in dev we return OTP in response)
  if (env.sparrowToken) {
    try {
      await fetch(env.sparrowApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", Authorization: `Bearer ${env.sparrowToken}` },
        body: new URLSearchParams({ from: env.sparrowFrom, to: `977${phone}`, text: `YatraSewa verification code: ${otp}. Valid for 5 minutes.` }),
      });
    } catch (e) {
      // swallow; dev fallback returns otp in response for testing
    }
  }

  return { sent: true, devOtp: env.nodeEnv !== "production" ? otp : undefined };
}

export async function verifyOtp(phone: string, otp: string): Promise<TokenResponse> {
  const key = `otp:${phone}`;
  const stored = await redis.get(key);
  if (!stored || stored !== otp) throw httpError(401, "Invalid or expired OTP");
  await redis.del(key);

  // Find or create the user (auto-register as CUSTOMER)
  let user = await prisma.user.findFirst({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: { phone, fullName: `Yatri ${phone.slice(-4)}`, role: "CUSTOMER" },
    });
  }
  if (!user.isActive) throw httpError(403, "Account deactivated. Contact support.");
  return buildTokens(user);
}

export async function refreshTokens(refreshToken: string): Promise<TokenResponse> {
  try {
    const payload = jwt.verify(refreshToken, env.jwtRefreshSecret) as JwtPayload;
    // Look up active session
    const sessions = await prisma.userSession.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });
    let valid = false;
    for (const s of sessions) {
      if (await verifyHash(s.refreshTokenHash, refreshToken)) {
        if (s.expiresAt < new Date()) throw httpError(401, "Refresh token expired");
        valid = true;
        break;
      }
    }
    if (!valid) throw httpError(401, "Invalid refresh token");
    const user = await prisma.user.findUniqueOrThrow({ where: { id: payload.userId } });
    return buildTokens(user);
  } catch {
    throw httpError(401, "Invalid refresh token");
  }
}

export async function logout(userId: string, refreshToken?: string) {
  if (refreshToken) {
    const sessions = await prisma.userSession.findMany({ where: { userId } });
    for (const s of sessions) {
      if (await verifyHash(s.refreshTokenHash, refreshToken)) {
        await prisma.userSession.delete({ where: { id: s.id } });
        break;
      }
    }
  } else {
    await prisma.userSession.deleteMany({ where: { userId } });
  }
}

export async function setupTotp(userId: string) {
  const secret = authenticator.generateSecret();
  await prisma.user.update({ where: { id: userId }, data: { totpSecret: secret } });
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const otpauth = authenticator.keyuri(user.email ?? user.phone ?? userId, "YatraSewa", secret);
  return { secret, otpauth };
}

export async function verifyTotp(userId: string, token: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  if (!user.totpSecret) throw httpError(400, "TOTP not set up");
  const ok = authenticator.verify({ token, secret: user.totpSecret });
  if (!ok) throw httpError(401, "Invalid TOTP code");
  await prisma.user.update({ where: { id: userId }, data: { is2faEnabled: true } });
}

export async function resetPassword(phone: string, otp: string, newPass: string) {
  const key = `otp:${phone}`;
  const stored = await redis.get(key);
  if (!stored || stored !== otp) throw httpError(401, "Invalid or expired OTP");
  await redis.del(key);

  const passwordHash = await argon2.hash(newPass);
  await prisma.user.update({
    where: { phone },
    data: { passwordHash },
  });
}

export async function storeRefreshToken(userId: string, refreshToken: string, userAgent?: string, ip?: string) {
  const hash = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + env.jwtRefreshTtlDays * 86400000);
  await prisma.userSession.create({
    data: {
      userId,
      refreshTokenHash: hash,
      userAgent: userAgent ?? null,
      ip: ip ?? null,
      expiresAt,
    },
  });
}
