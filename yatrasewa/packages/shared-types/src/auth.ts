import { z } from "zod";

export const PhoneLoginRequestSchema = z.object({
  phone: z.string().regex(/^9[78]\d{8}$/, "Must be a valid 10-digit Nepal mobile number starting 98/97"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type PhoneLoginRequest = z.infer<typeof PhoneLoginRequestSchema>;

export const EmailLoginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});
export type EmailLoginRequest = z.infer<typeof EmailLoginRequestSchema>;

export const SendOtpRequestSchema = z.object({
  phone: z.string().regex(/^9[78]\d{8}$/),
  purpose: z.enum(["login", "signup", "password_reset", "verify_booking"]).default("login"),
});
export type SendOtpRequest = z.infer<typeof SendOtpRequestSchema>;

export const VerifyOtpRequestSchema = z.object({
  phone: z.string().regex(/^9[78]\d{8}$/),
  otp: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  purpose: z.enum(["login", "signup", "password_reset", "verify_booking"]).default("login"),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;

export const TotpSetupResponseSchema = z.object({
  secret: z.string(),
  otpauthUrl: z.string().url(),
  recoveryCodes: z.array(z.string().length(8)).length(8),
});
export type TotpSetupResponse = z.infer<typeof TotpSetupResponseSchema>;

export const TotpVerifyRequestSchema = z.object({
  token: z.string().regex(/^\d{6}$/),
});
export type TotpVerifyRequest = z.infer<typeof TotpVerifyRequestSchema>;

export const RefreshRequestSchema = z.object({
  refreshToken: z.string().min(20),
});
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
  user: z.object({
    id: z.string().uuid(),
    fullName: z.string(),
    phone: z.string().nullable(),
    email: z.string().nullable(),
    role: z.string(),
    operatorId: z.string().nullable(),
    counterId: z.string().nullable(),
    is2faEnabled: z.boolean(),
    requires2fa: z.boolean().default(false),
  }),
});
export type TokenResponse = z.infer<typeof TokenResponseSchema>;

export const PasswordResetRequestSchema = z.object({
  phone: z.string().regex(/^9[78]\d{8}$/),
  otp: z.string().regex(/^\d{6}$/),
  newPassword: z.string().min(8),
});
export type PasswordResetRequest = z.infer<typeof PasswordResetRequestSchema>;
