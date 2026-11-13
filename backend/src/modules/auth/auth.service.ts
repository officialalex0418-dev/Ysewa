// @ts-nocheck
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { env } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { httpError } from "../../middlewares/error-handler.js";
import { User, IUser } from "../../models/User.js";

const OTP_TTL_SECONDS = 300;
const OTP_MAX_SENDS_PER_WINDOW = 3;
const OTP_WINDOW_SECONDS = 900;

function signAccessToken(p: any) {
  return jwt.sign(p, env.jwtAccessSecret, { expiresIn: `${env.jwtAccessTtlMinutes}m` });
}

function signRefreshToken(p: any) {
  return jwt.sign(p, env.jwtRefreshSecret, { expiresIn: `${env.jwtRefreshTtlDays}d` });
}

function buildTokens(user: IUser) {
  const payload = { userId: user.id, role: user.role, operatorId: user.operatorId, counterId: user.counterId };
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
      is2faEnabled: user.is2faEnabled || false,
      requires2fa: false,
    },
  };
}

export async function loginWithPassword(phoneOrEmail: string, password: string) {
  const user = await User.findOne({
    $or: [{ email: phoneOrEmail }, { phone: phoneOrEmail }],
  });

  if (!user) throw httpError(401, "Invalid credentials");

  const isValid = await argon2.verify(user.passwordHash, password);
  if (!isValid) throw httpError(401, "Invalid credentials");

  return buildTokens(user);
}

export async function sendOtp(phone: string, _purpose: string) {
  // Check if user exists
  let user = await User.findOne({ phone });
  if (!user) {
     // Auto-create basic user if not exists for OTP login
     user = await User.create({
         fullName: `Yatri ${phone.slice(-4)}`,
         phone,
         role: "CUSTOMER",
         passwordHash: await argon2.hash(Math.random().toString(36).slice(-10)),
     });
  }

  const otp = String(Math.floor(100000 + Math.random() * 900000));
  await redis.setex(`otp:${phone}`, OTP_TTL_SECONDS, otp);
  // Send SMS using actual SMS gateway API (mocked here)
  return { sent: true, devOtp: otp }; // In prod, devOtp should not be returned
}

export async function verifyOtp(phone: string, otp: string) {
  const savedOtp = await redis.get(`otp:${phone}`);
  if (!savedOtp || savedOtp !== otp) throw httpError(400, "Invalid or expired OTP");

  await redis.del(`otp:${phone}`);

  const user = await User.findOne({ phone });
  if (!user) throw httpError(404, "User not found");

  return buildTokens(user);
}

