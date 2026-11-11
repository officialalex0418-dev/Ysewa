import { z } from "zod";

export const GpsPingSchema = z.object({
  tripId: z.string().uuid(),
  busId: z.string().uuid(),
  timestamp: z.coerce.date(),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speedKmh: z.number().min(0).max(200).default(0),
  headingDeg: z.number().min(0).max(360).default(0),
  accuracyM: z.number().min(0).default(10),
  source: z.enum(["driver_app", "hardware_tracker"]).default("driver_app"),
});
export type GpsPing = z.infer<typeof GpsPingSchema>;

export const BusLiveStateSchema = z.object({
  tripId: z.string().uuid(),
  busId: z.string().uuid(),
  operatorId: z.string(),
  lat: z.number(),
  lng: z.number(),
  speedKmh: z.number(),
  headingDeg: z.number(),
  lastUpdate: z.coerce.date(),
  nextStopName: z.string().optional(),
  nextStopDistanceM: z.number().optional(),
  etaMinutes: z.number().optional(),
  occupancyPercent: z.number().min(0).max(100).optional(),
});
export type BusLiveState = z.infer<typeof BusLiveStateSchema>;

export const GeofenceAlertSchema = z.object({
  tripId: z.string().uuid(),
  stopId: z.string().uuid(),
  stopName: z.string(),
  distanceM: z.number(),
  etaMinutes: z.number(),
  triggeredAt: z.coerce.date(),
  /** Channel push targets: phones of booked passengers on this trip with this stop */
  alertType: z.enum(["boarding_approaching", "drop_approaching", "delayed"]),
});
export type GeofenceAlert = z.infer<typeof GeofenceAlertSchema>;

export const OfflineSyncRequestSchema = z.object({
  tripId: z.string().uuid(),
  /** Batched pings captured while offline */
  pings: z.array(GpsPingSchema).max(2000),
  /** Check-in events captured offline: {pnr, seatLabel, scannedAt} */
  checkins: z
    .array(
      z.object({
        pnr: z.string(),
        seatLabel: z.string(),
        scannedAt: z.coerce.date(),
        qrSigValid: z.boolean(),
      }),
    )
    .max(500),
});
export type OfflineSyncRequest = z.infer<typeof OfflineSyncRequestSchema>;
