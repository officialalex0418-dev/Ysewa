import { z } from "zod";

export const GatewayEnum = z.enum(["esewa", "khalti", "connectips", "fonepay", "bookie_float", "conductor_cash"]);
export type Gateway = z.infer<typeof GatewayEnum>;

export const PaymentStatusEnum = z.enum(["PENDING", "INITIATED", "COMPLETED", "FAILED", "CANCELLED", "REFUNDED", "VERIFYING"]);
export type PaymentStatus = z.infer<typeof PaymentStatusEnum>;

export const PaymentTransactionSchema = z.object({
  id: z.string().uuid(),
  bookingId: z.string().uuid(),
  gateway: GatewayEnum,
  amount: z.number(),
  gatewayTransactionId: z.string().nullable(),
  status: PaymentStatusEnum,
  verified: z.boolean(),
  createdAt: z.coerce.date(),
  verifiedAt: z.coerce.date().nullable(),
});
export type PaymentTransaction = z.infer<typeof PaymentTransactionSchema>;

// === eSewa ePay v2 ===
export const EsewaInitiateRequestSchema = z.object({
  bookingId: z.string().uuid(),
});
export type EsewaInitiateRequest = z.infer<typeof EsewaInitiateRequestSchema>;

export const EsewaFormPayloadSchema = z.object({
  amount: z.string(),
  tax_amount: z.string().default("0"),
  total_amount: z.string(),
  transaction_uuid: z.string(),
  product_code: z.string(),
  product_service_charge: z.string().default("0"),
  product_delivery_charge: z.string().default("0"),
  success_url: z.string().url(),
  failure_url: z.string().url(),
  signed_field_names: z.string(),
  signature: z.string(),
});
export type EsewaFormPayload = z.infer<typeof EsewaFormPayloadSchema>;

export const EsewaStatusResponseSchema = z.object({
  status: z.enum(["COMPLETE", "PENDING", "FULL_REFUND", "CANCELED", "NOT FOUND"]),
  transaction_code: z.string().optional(),
  total_amount: z.string().optional(),
  product_code: z.string().optional(),
  merchant_name: z.string().optional(),
});
export type EsewaStatusResponse = z.infer<typeof EsewaStatusResponseSchema>;

// === Khalti KPG-2 ===
export const KhaltiInitiateRequestSchema = z.object({
  bookingId: z.string().uuid(),
});
export type KhaltiInitiateRequest = z.infer<typeof KhaltiInitiateRequestSchema>;

export const KhaltiInitiateResponseSchema = z.object({
  pidx: z.string(),
  payment_url: z.string().url(),
  expires_at: z.coerce.date().optional(),
  expires_in: z.number().optional(),
});
export type KhaltiInitiateResponse = z.infer<typeof KhaltiInitiateResponseSchema>;

export const KhaltiLookupResponseSchema = z.object({
  pidx: z.string(),
  total_amount: z.number(), // in PAISA
  status: z.enum(["Completed", "Pending", "Failed", "Initiated", "Refunded", "Expired"]),
  transaction_id: z.string().optional(),
  tidx: z.string().optional(),
  fee: z.number().optional(),
});
export type KhaltiLookupResponse = z.infer<typeof KhaltiLookupResponseSchema>;

// === ConnectIPS NCHL ===
export const ConnectIpsInitiateRequestSchema = z.object({
  bookingId: z.string().uuid(),
});
export type ConnectIpsInitiateRequest = z.infer<typeof ConnectIpsInitiateRequestSchema>;

export const ConnectIpsFormPayloadSchema = z.object({
  MERCHANTID: z.string(),
  APPID: z.string(),
  APPNAME: z.string(),
  TXNID: z.string(),
  TXNDATE: z.string(),
  TXNCRNCY: z.literal("NPR"),
  TXNAMT: z.string(),
  REFERENCEID: z.string(),
  REMARKS: z.string(),
  PARTICULARS: z.string(),
  TOKEN: z.string(),
});
export type ConnectIpsFormPayload = z.infer<typeof ConnectIpsFormPayloadSchema>;

export const ConnectIpsValidateResponseSchema = z.object({
  status: z.enum(["SUCCESS", "FAILURE", "PENDING"]),
  txnId: z.string(),
  amount: z.string(),
  referenceId: z.string().optional(),
  approvalNumber: z.string().optional(),
});
export type ConnectIpsValidateResponse = z.infer<typeof ConnectIpsValidateResponseSchema>;

// === Fonepay Dynamic QR ===
export const FonepayQrRequestSchema = z.object({
  bookingId: z.string().uuid(),
});
export type FonepayQrRequest = z.infer<typeof FonepayQrRequestSchema>;

export const FonepayQrPayloadSchema = z.object({
  qrData: z.string(), // EMVCo QR string
  qrImageDataUrl: z.string().optional(),
  merchantCode: z.string(),
  amount: z.string(),
  prn: z.string(), // payment reference number
  signature: z.string(), // HMAC-SHA512
});
export type FonepayQrPayload = z.infer<typeof FonepayQrPayloadSchema>;

// === Payment Method descriptor (for UI) ===
export const PaymentMethodSchema = z.object({
  id: GatewayEnum,
  name: z.string(),
  tagline: z.string(),
  badge: z.string().optional(),
  iconKey: z.enum(["esewa", "khalti", "fonepay", "connectips", "cash", "wallet"]),
  enabled: z.boolean().default(true).optional(),
});
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "esewa", name: "eSewa", tagline: "Pay using eSewa wallet", badge: "POPULAR", iconKey: "esewa", enabled: true },
  { id: "khalti", name: "Khalti", tagline: "Mobile banking & Khalti digital wallet", iconKey: "khalti", enabled: true },
  { id: "fonepay", name: "FonePay", tagline: "QR scan & bank transfer", iconKey: "fonepay", enabled: true },
  { id: "connectips", name: "ConnectIPS", tagline: "Direct bank transfer (NCHL)", iconKey: "connectips", enabled: true },
];
