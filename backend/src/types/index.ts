import { z } from "zod";

export const SendOtpRequestSchema = z.object({
  phone: z.string().min(10),
  purpose: z.string().default("LOGIN"),
});

export const VerifyOtpRequestSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
});

export const RefreshRequestSchema = z.object({
  refreshToken: z.string(),
});

export const TotpVerifyRequestSchema = z.object({
  token: z.string().length(6),
});

export const PasswordResetRequestSchema = z.object({
  phone: z.string().min(10),
  otp: z.string().length(6),
  newPassword: z.string().min(6),
});

export const GpsPingSchema = z.object({
  tripId: z.string(),
  lat: z.number(),
  lng: z.number(),
  speed: z.number().optional(),
  heading: z.number().optional(),
});

export type GpsPing = z.infer<typeof GpsPingSchema>;

export const DEFAULT_CANCEL_POLICY = {
  noticeHours: 24,
  refundPercentage: 85,
  description: "Cancel 24h before departure for 85% refund.",
};

export function formatNpr(n?: number | string | null): string {
  if (n === undefined || n === null) return "Rs. 0";
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "Rs. 0";
  return `Rs. ${num.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function generate2x2Deluxe(layoutName: string) {
  return {
    name: layoutName,
    deckCount: 1,
    rows: 10,
    cols: 4,
  };
}
