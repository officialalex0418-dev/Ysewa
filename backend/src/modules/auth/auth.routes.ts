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
} from "@yatrasewa/shared-types";
import {
  loginWithPassword,
  registerUser,
  sendOtp,
  verifyOtp,
  refreshTokens,
  logout,
  setupTotp,
  verifyTotp,
  resetPassword,
  storeRefreshToken,
} from "./auth.service.js";

const router = Router();

const PasswordLoginSchema = z.object({
  phone: z.string().optional(),
  email: z.string().email().optional(),
  password: z.string().min(6),
}).refine((d) => d.phone || d.email, { message: "Phone or email required" });

const RegisterSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  password: z.string().min(6),
}).refine((d) => d.email || d.phone, { message: "Email or phone required" });

router.post("/login", validate(PasswordLoginSchema), async (req, res, next) => {
  try {
    const ident = (req.body.phone ?? req.body.email)!;
    const login = await loginWithPassword(ident, req.body.password);
    await storeRefreshToken(login.user.id, login.refreshToken, req.headers["user-agent"], req.ip);
    res.json(login);
  } catch (e) { next(e); }
});

router.post("/register", validate(RegisterSchema), async (req, res, next) => {
  try {
    const r = await registerUser(req.body);
    await storeRefreshToken(r.user.id, r.refreshToken, req.headers["user-agent"], req.ip);
    res.json(r);
  } catch (e) { next(e); }
});

router.post("/send-otp", validate(SendOtpRequestSchema), async (req, res, next) => {
  try { res.json(await sendOtp(req.body.phone, req.body.purpose ?? "login")); } catch (e) { next(e); }
});

router.post("/verify-otp", validate(VerifyOtpRequestSchema), async (req, res, next) => {
  try {
    const r = await verifyOtp(req.body.phone, req.body.otp);
    await storeRefreshToken(r.user.id, r.refreshToken, req.headers["user-agent"], req.ip);
    res.json(r);
  } catch (e) { next(e); }
});

router.post("/refresh", validate(RefreshRequestSchema), async (req, res, next) => {
  try { res.json(await refreshTokens(req.body.refreshToken)); } catch (e) { next(e); }
});

router.post("/logout", authRequired, async (req, res, next) => {
  try { await logout(req.user!.userId, req.body.refreshToken); res.json({ success: true }); } catch (e) { next(e); }
});

router.post("/totp/setup", authRequired, async (req, res, next) => {
  try { res.json(await setupTotp(req.user!.userId)); } catch (e) { next(e); }
});

router.post("/totp/verify", authRequired, validate(TotpVerifyRequestSchema), async (req, res, next) => {
  try { await verifyTotp(req.user!.userId, req.body.token); res.json({ success: true }); } catch (e) { next(e); }
});

router.post("/password-reset", validate(PasswordResetRequestSchema), async (req, res, next) => {
  try { await resetPassword(req.body.phone, req.body.otp, req.body.newPassword); res.json({ success: true }); } catch (e) { next(e); }
});

export default router;
