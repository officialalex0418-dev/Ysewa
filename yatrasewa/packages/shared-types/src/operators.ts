import { z } from "zod";

export const OperatorStatusEnum = z.enum(["pending", "approved", "suspended", "under_audit"]);
export type OperatorStatus = z.infer<typeof OperatorStatusEnum>;

export const KycDocTypeEnum = z.enum([
  "dotm_operating_license",
  "company_registration",
  "pan_vat_registration",
  "fleet_insurance_policy",
  "pan_document",
]);
export type KycDocType = z.infer<typeof KycDocTypeEnum>;

export const KycStatusEnum = z.enum(["pending", "uploaded", "verified", "rejected"]);
export type KycStatus = z.infer<typeof KycStatusEnum>;

export const OperatorSchema = z.object({
  id: z.string(), // OP-NP-XXXX
  legalName: z.string(),
  brandName: z.string(),
  panNo: z.string(),
  panVerified: z.boolean().default(false),
  status: OperatorStatusEnum,
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  primaryAddress: z.string(),
  logoUrl: z.string().nullable(),
  commissionRate: z.number().min(0).max(0.5), // platform commission
  createdAt: z.coerce.date(),
  approvedAt: z.coerce.date().nullable(),
  suspendedAt: z.coerce.date().nullable(),
});
export type Operator = z.infer<typeof OperatorSchema>;

export const KycDocumentSchema = z.object({
  id: z.string().uuid(),
  operatorId: z.string(),
  docType: KycDocTypeEnum,
  fileUrl: z.string(),
  status: KycStatusEnum,
  uploadedAt: z.coerce.date(),
  verifiedAt: z.coerce.date().nullable(),
  notes: z.string().nullable(),
});
export type KycDocument = z.infer<typeof KycDocumentSchema>;

export const VehicleAmenitiesSchema = z.object({
  wifi: z.boolean().default(false),
  chargingPort: z.boolean().default(false),
  waterBottle: z.boolean().default(false),
  blanket: z.boolean().default(false),
  readingLight: z.boolean().default(false),
  cctv: z.boolean().default(false),
  ac: z.boolean().default(false),
  lunchIncluded: z.boolean().default(false),
  gpsTelematics: z.boolean().default(false),
  usbCharging: z.boolean().default(false),
});
export type VehicleAmenities = z.infer<typeof VehicleAmenitiesSchema>;

export const VehicleTypeEnum = z.enum(["deluxe", "ac_deluxe", "vip_sofa_2x1", "sleeper", "tourist"]);
export type VehicleType = z.infer<typeof VehicleTypeEnum>;

export const BusSchema = z.object({
  id: z.string().uuid(),
  operatorId: z.string(),
  plateNumber: z.string(), // e.g., "BA 2 KHA 4512"
  nickname: z.string().optional(),
  cabinLayoutId: z.string().uuid(),
  vehicleType: VehicleTypeEnum,
  amenities: VehicleAmenitiesSchema,
  registrationDocUrl: z.string().nullable(),
  insuranceDocUrl: z.string().nullable(),
  fitnessCertUrl: z.string().nullable(),
  status: z.enum(["active", "maintenance", "retired", "documents_expired"]).default("active"),
});
export type Bus = z.infer<typeof BusSchema>;

/** Sample operator IDs for seed */
export const SAMPLE_OPERATORS: Array<Pick<Operator, "id" | "legalName" | "brandName" | "panNo" | "contactEmail" | "contactPhone" | "primaryAddress" | "commissionRate" | "status">> = [
  { id: "OP-NP-8821", legalName: "Greenline Travels & Tours Pvt. Ltd.", brandName: "Greenline Travels", panNo: "302576912", contactEmail: "info@greenlinetravels.com.np", contactPhone: "+977 9851023456", primaryAddress: "Sorakhutte, Kathmandu", commissionRate: 0.10, status: "approved" },
  { id: "OP-NP-1001", legalName: "Sajha Yatayat Cooperative Ltd.", brandName: "Sajha Yatayat", panNo: "300111222", contactEmail: "info@sajhayatayat.org.np", contactPhone: "+977 9801234567", primaryAddress: "Pulchowk, Lalitpur", commissionRate: 0.08, status: "approved" },
  { id: "OP-NP-2048", legalName: "Mountain Deluxe Express Pvt. Ltd.", brandName: "Mountain Deluxe Express", panNo: "309988776", contactEmail: "bookings@mountaindeluxe.com.np", contactPhone: "+977 9841005500", primaryAddress: "New Buspark, Kathmandu", commissionRate: 0.12, status: "approved" },
  { id: "OP-NP-7777", legalName: "Buddha Air Surface Transport Pvt. Ltd.", brandName: "Buddha Air Surface", panNo: "307778888", contactEmail: "surface@buddhaair.com", contactPhone: "+977 9802003001", primaryAddress: "Jawalakhel, Lalitpur", commissionRate: 0.09, status: "under_audit" },
];

export const SAMPLE_BUSES = [
  { plateNumber: "BA 2 KHA 4512", nickname: "Greenline Deluxe", vehicleType: "ac_deluxe" as const },
  { plateNumber: "BA 3 KHA 8820", nickname: "Greenline VIP Sofa", vehicleType: "vip_sofa_2x1" as const },
  { plateNumber: "NA 2 KHA 1105", nickname: "Sajha Sleeper", vehicleType: "sleeper" as const },
  { plateNumber: "GA 2 KHA 4390", nickname: "Mountain Tourist", vehicleType: "deluxe" as const },
];
