import { z } from "zod";

export const BookingChannelEnum = z.enum(["online", "bookie", "conductor"]);
export type BookingChannel = z.infer<typeof BookingChannelEnum>;

export const BookingStatusEnum = z.enum([
  "PENDING_PAYMENT",
  "CONFIRMED",
  "CANCELLED",
  "REFUNDED",
  "EXPIRED",
]);
export type BookingStatus = z.infer<typeof BookingStatusEnum>;

export const PassengerGenderEnum = z.enum(["male", "female", "other"]);
export type PassengerGender = z.infer<typeof PassengerGenderEnum>;

export const IdTypeEnum = z.enum(["citizenship", "passport", "driving_license", "national_id", "none"]);
export type IdType = z.infer<typeof IdTypeEnum>;

export const BookingPassengerSchema = z.object({
  id: z.string().uuid().optional(),
  fullName: z.string().min(2, "Passenger name required"),
  age: z.number().int().min(1).max(120),
  gender: PassengerGenderEnum,
  seatLabel: z.string(),
  idType: IdTypeEnum.default("none"),
  idNumber: z.string().optional(),
  checkedIn: z.boolean().default(false),
  checkedInAt: z.coerce.date().optional(),
});
export type BookingPassenger = z.infer<typeof BookingPassengerSchema>;

export const CreateBookingRequestSchema = z.object({
  tripId: z.string().uuid(),
  seats: z.array(z.string()).min(1).max(6),
  passengers: z.array(BookingPassengerSchema).min(1),
  channel: BookingChannelEnum.default("online"),
  counterId: z.string().uuid().optional(),
  couponCode: z.string().optional(),
  contactPhone: z.string().regex(/^9[78]\d{8}$/),
  contactEmail: z.string().email().optional(),
});
export type CreateBookingRequest = z.infer<typeof CreateBookingRequestSchema>;

export const BookingSchema = z.object({
  id: z.string().uuid(),
  pnr: z.string().regex(/^YS-[A-Z0-9]{4}-[A-Z0-9]{6}$/),
  userId: z.string().uuid().nullable(),
  tripId: z.string().uuid(),
  counterId: z.string().uuid().nullable(),
  channel: BookingChannelEnum,
  status: BookingStatusEnum,
  totalFare: z.number(), // NPR
  discount: z.number().default(0),
  taxAmount: z.number().default(0),
  platformFee: z.number().default(0),
  netPayable: z.number(),
  passengerCount: z.number().int(),
  seatLabels: z.array(z.string()),
  passengers: z.array(BookingPassengerSchema).optional(),
  createdAt: z.coerce.date(),
  confirmedAt: z.coerce.date().nullable(),
  cancelledAt: z.coerce.date().nullable(),
});
export type Booking = z.infer<typeof BookingSchema>;

export const CancelBookingRequestSchema = z.object({
  reason: z.string().min(3).max(500),
});
export type CancelBookingRequest = z.infer<typeof CancelBookingRequestSchema>;

export const CancelPolicyRowSchema = z.object({
  label: z.string(),
  hoursBefore: z.number(), // minimum hours before departure this row applies
  feePercent: z.number(),
  refundPercent: z.number(),
  colorClass: z.string(),
});
export type CancelPolicyRow = z.infer<typeof CancelPolicyRowSchema>;

export const DEFAULT_CANCEL_POLICY: CancelPolicyRow[] = [
  { label: "More than 24h before departure", hoursBefore: 24, feePercent: 0, refundPercent: 100, colorClass: "text-emerald" },
  { label: "12-24h before departure", hoursBefore: 12, feePercent: 25, refundPercent: 75, colorClass: "text-warning" },
  { label: "6-12h before departure", hoursBefore: 6, feePercent: 50, refundPercent: 50, colorClass: "text-danger" },
  { label: "Less than 6h or No-show", hoursBefore: 0, feePercent: 100, refundPercent: 0, colorClass: "text-danger" },
];
