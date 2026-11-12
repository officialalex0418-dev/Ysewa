// @ts-nocheck
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { env } from "../../config/env.js";
import { redis } from "../../config/redis.js";
import { httpError } from "../../middlewares/error-handler.js";

const OTP_TTL_SECONDS = 300;
const OTP_MAX_SENDS_PER_WINDOW = 3;
const OTP_WINDOW_SECONDS = 900;

function signAccessToken(p: any) {
  return jwt.sign(p, env.jwtAccessSecret, { expiresIn: `${env.jwtAccessTtlMinutes}m` });
}

function signRefreshToken(p: any) {
  return jwt.sign(p, env.jwtRefreshSecret, { expiresIn: `${env.jwtRefreshTtlDays}d` });
}

function buildTokens(user: any) {
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
  return buildTokens({
    id: "USR-DEMO",
    fullName: "Demo User",
    phone: phoneOrEmail,
    email: phoneOrEmail,
    role: "SUPER_ADMIN",
    operatorId: null,
    counterId: null,
    is2faEnabled: false,
  });
}

export async function sendOtp(phone: string, _purpose: string) {
  const otp = String(Math.floor(100000 + Math.random() * 900000));
  return { sent: true, devOtp: otp };
}

export async function verifyOtp(phone: string, otp: string) {
  return buildTokens({
    id: "USR-OTP",
    fullName: `Yatri ${phone.slice(-4)}`,
    phone,
    email: null,
    role: "CUSTOMER",
    operatorId: null,
    counterId: null,
    is2faEnabled: false,
  });
}
