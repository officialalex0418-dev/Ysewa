import { z } from "zod";

export const SeatTypeEnum = z.enum(["regular", "lady", "vip", "sleeper", "driver", "door", "crew"]);
export type SeatType = z.infer<typeof SeatTypeEnum>;

export const SeatStatusEnum = z.enum(["available", "selected", "locked", "booked", "held_crew", "ladies_blocked"]);
export type SeatStatus = z.infer<typeof SeatStatusEnum>;

export const SeatSchema = z.object({
  label: z.string(), // "A1", "B3", "S7"
  row: z.number().int(),
  col: z.number().int(),
  type: SeatTypeEnum,
  deck: z.number().int().default(1).optional(), // 1 = lower, 2 = upper
  x: z.number().optional(), // for visual layouts: pixel position
  y: z.number().optional(),
  width: z.number().default(1).optional(), // for sleeper spans 2 cols
  height: z.number().default(1).optional(),
});
export type Seat = z.infer<typeof SeatSchema>;

/**
 * Cabin layout JSON structure (stored as JSONB in cabin_layouts.layout_json).
 * Supports 2x2 Deluxe, 2x1 VIP Sofa, single/double-decker Sleepers.
 */
export const CabinLayoutSchema = z.object({
  name: z.string(),
  deckCount: z.number().int().min(1).max(2),
  seatsPerRow: z.number().int(),
  totalSeats: z.number().int(),
  seats: z.array(SeatSchema),
  /** Aisles defined as x-index gaps; empty cells are represented by seats of type "door" or simply absent */
  aisleCols: z.array(z.number().int()).default([]),
});
export type CabinLayout = z.infer<typeof CabinLayoutSchema>;

export const SeatSelectionSchema = z.object({
  tripId: z.string().uuid(),
  seatLabels: z.array(z.string()).min(1).max(6),
});
export type SeatSelection = z.infer<typeof SeatSelectionSchema>;

export const SeatLockResponseSchema = z.object({
  success: z.boolean(),
  lockToken: z.string().optional(),
  expiresAt: z.coerce.date().optional(),
  failedSeats: z.array(z.string()).optional(),
  /** 0 = available, 1 = locked-by-you, 2 = locked-by-other, 3 = booked */
  seatStates: z.record(z.string(), z.number().int()).optional(),
});
export type SeatLockResponse = z.infer<typeof SeatLockResponseSchema>;

/** Helper to generate preset 2x2 Deluxe (40 seats) */
export function generate2x2Deluxe(name = "2x2 Deluxe Coach"): CabinLayout {
  const seats: Seat[] = [];
  let num = 1;
  const rows = 10;
  const rowLetters = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
  // 2x2 layout: cols 0,1 (left pair) aisle col2 cols 3,4 (right pair)
  for (let r = 0; r < rows; r++) {
    const letter = rowLetters[r]!;
    // Add driver area only on first row
    for (const c of [0, 1, 3, 4]) {
      let type: SeatType = "regular";
      if (r === 0 && c === 0) type = "driver";
      const seat: Seat = {
        label: type === "driver" ? "DRV" : `${letter}${num++}`,
        row: r,
        col: c,
        type,
      };
      seats.push(seat);
    }
  }
  // Mark last row last seat as crew/held
  return {
    name,
    deckCount: 1,
    seatsPerRow: 4,
    totalSeats: seats.filter((s) => s.type === "regular").length,
    seats,
    aisleCols: [2],
  };
}

/** Helper to generate Sleeper layout (2+1 per row, upper + lower) */
export function generateSleeper(name = "Sleeper AC"): CabinLayout {
  const seats: Seat[] = [];
  const rows = 12;
  let n = 1;
  for (let deck = 1; deck <= 2; deck++) {
    for (let r = 0; r < rows; r++) {
      for (const c of [0, 2, 4]) {
        seats.push({
          label: `S${n++}`,
          row: r,
          col: c,
          type: "sleeper",
          deck,
          width: c === 2 ? 1 : 2, // single on left; double lower/upper
          height: 1,
        });
      }
    }
  }
  return {
    name,
    deckCount: 2,
    seatsPerRow: 3,
    totalSeats: seats.length,
    seats,
    aisleCols: [1, 3],
  };
}
