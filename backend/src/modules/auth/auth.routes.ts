// @ts-nocheck
import { Router } from "express";
import { z } from "zod";
import { validate } from "../../middlewares/validate.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import {
  SendOtpRequestSchema,
  VerifyOtpRequestSchema,
  RefreshRequestSchema,
  TotpVerifyRequestSchema,
  PasswordResetRequestSchema,
} from "../../types/index.js";
import {
  loginWithPassword,
  sendOtp,
  verifyOtp,
} from "./auth.service.js";

const router = Router();

const LoginSchema = z.object({
  phoneOrEmail: z.string().min(3),
  password: z.string().min(1),
});

router.post("/login", validate(LoginSchema), async (req, res, next) => {
  try {
    const r = await loginWithPassword(req.body.phoneOrEmail, req.body.password);
    res.json(r);
  } catch (e) {
    next(e);
  }
});

router.post("/send-otp", validate(SendOtpRequestSchema), async (req, res, next) => {
  try {
    const r = await sendOtp(req.body.phone, req.body.purpose);
    res.json(r);
  } catch (e) {
    next(e);
  }
});

router.post("/verify-otp", validate(VerifyOtpRequestSchema), async (req, res, next) => {
  try {
    const r = await verifyOtp(req.body.phone, req.body.otp);
    res.json(r);
  } catch (e) {
    next(e);
  }
});

router.post("/refresh", validate(RefreshRequestSchema), async (_req, res) => {
  res.json({ accessToken: "mock-access-token", refreshToken: "mock-refresh-token" });
});

router.post("/logout", authRequired, async (_req, res) => {
  res.json({ success: true });
});

export default router;
