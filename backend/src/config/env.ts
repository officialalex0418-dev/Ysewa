/**
 * Environment configuration loader.
 * Validates required variables are present and provides defaults.
 */
function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) throw new Error(`Missing required env var ${name}`);
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: parseInt(process.env.API_PORT ?? "4000", 10),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  databaseUrl: required("DATABASE_URL", "postgresql://yatrasewa:yatrasewa@localhost:5432/yatrasewa?schema=public"),
  redisUrl: required("REDIS_URL", "redis://localhost:6379"),

  jwtAccessSecret: required("JWT_ACCESS_SECRET", "dev-access-secret-change-me-please-32chars"),
  jwtRefreshSecret: required("JWT_REFRESH_SECRET", "dev-refresh-secret-change-me-32chars!!"),
  jwtAccessTtlMinutes: parseInt(process.env.JWT_ACCESS_TTL_MINUTES ?? "15", 10),
  jwtRefreshTtlDays: parseInt(process.env.JWT_REFRESH_TTL_DAYS ?? "30", 10),

  // SMS (Sparrow)
  sparrowToken: process.env.SPARROW_SMS_TOKEN ?? "",
  sparrowFrom: process.env.SPARROW_SMS_FROM ?? "YatraSewa",
  sparrowApiUrl: process.env.SPARROW_SMS_API_URL ?? "https://api.sparrowmessages.com/v2/sms",

  // SMTP
  smtpHost: process.env.SMTP_HOST ?? "",
  smtpPort: parseInt(process.env.SMTP_PORT ?? "587", 10),
  smtpUser: process.env.SMTP_USER ?? "",
  smtpPass: process.env.SMTP_PASS ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "YatraSewa <no-reply@yatrasewa.com.np>",

  // Gateways
  esewa: {
    productCode: process.env.ESEWA_PRODUCT_CODE ?? "EPAYTEST",
    secretKey: process.env.ESEWA_SECRET_KEY ?? "8gBm/:&EnhH.1/q", // eSewa test secret
    baseUrl: process.env.ESEWA_BASE_URL ?? "https://rc-epay.esewa.com.np",
    statusUrl: process.env.ESEWA_STATUS_URL ?? "https://rc.esewa.com.np/api/epay/transaction/status/",
    successUrl: process.env.ESEWA_SUCCESS_URL ?? "http://localhost:5173/payment/esewa/success",
    failureUrl: process.env.ESEWA_FAILURE_URL ?? "http://localhost:5173/payment/esewa/failure",
  },
  khalti: {
    secretKey: process.env.KHALTI_SECRET_KEY ?? "test_secret_key_fallback",
    returnUrl: process.env.KHALTI_RETURN_URL ?? "http://localhost:5173/payment/khalti/callback",
    baseUrl: process.env.KHALTI_BASE_URL ?? "https://a.khalti.com/api/v2",
    websiteUrl: process.env.KHALTI_WEBSITE_URL ?? "http://localhost:5173",
  },
  connectips: {
    merchantId: process.env.CONNECTIPS_MERCHANT_ID ?? "TEST-MID",
    appId: process.env.CONNECTIPS_APP_ID ?? "TEST-APP",
    appName: process.env.CONNECTIPS_APP_NAME ?? "YatraSewa",
    pfxPath: process.env.CONNECTIPS_PFX_PATH ?? "",
    pfxPassword: process.env.CONNECTIPS_PFX_PASSWORD ?? "",
    validateUrl: process.env.CONNECTIPS_VALIDATE_URL ?? "https://connectips.com.np/connectipswebws/api/creditor/validatetxn",
    successUrl: process.env.CONNECTIPS_SUCCESS_URL ?? "http://localhost:5173/payment/connectips/success",
    failureUrl: process.env.CONNECTIPS_FAILURE_URL ?? "http://localhost:5173/payment/connectips/failure",
  },
  fonepay: {
    merchantCode: process.env.FONEPAY_MERCHANT_CODE ?? "TEST-FONEPAY",
    secretKey: process.env.FONEPAY_SECRET_KEY ?? "",
    baseUrl: process.env.FONEPAY_BASE_URL ?? "https://fonepay.com/api/v1",
  },
  ticketQrHmacSecret: process.env.TICKET_QR_HMAC_SECRET ?? "dev-qr-hmac-secret-please-change-in-prod",

  platformCommission: 0.1, // 10% default, overridden per operator
  tdsRate: 0.015, // 1.5%
  seatLockTtlOnline: 600,
  seatLockTtlBookie: 180,
  geofenceRadiusM: 1500,
};
