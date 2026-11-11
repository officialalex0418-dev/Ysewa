import { prisma } from "@yatrasewa/database";
import { redis, loadSeatLockScripts } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { httpError } from "../../middlewares/error-handler.js";

const LOADED = { acquireSha: "", releaseSha: "" };

async function getShas() {
  if (!LOADED.acquireSha) {
    const shas = await loadSeatLockScripts();
    LOADED.acquireSha = shas.acquireSha;
    LOADED.releaseSha = shas.releaseSha;
  }
  return LOADED;
}

export interface LockSeatsInput {
  tripId: string;
  seatLabels: string[];
  actorId: string;
  channel: "online" | "bookie" | "conductor";
}

/**
 * Atomically lock seats via Redis Lua script and create a PENDING_PAYMENT booking row in PG.
 * Socket.IO broadcast is done by caller (controller) after tx commit.
 */
export async function acquireSeats(input: LockSeatsInput) {
  const { tripId, seatLabels, actorId, channel } = input;
  const ttl = channel === "online" ? env.seatLockTtlOnline : channel === "bookie" ? env.seatLockTtlBookie : 30;
  const keys = seatLabels.map((l) => `seat_lock:${tripId}:${l}`);

  // Check trip exists
  const trip = await prisma.trip.findUnique({ where: { id: tripId }, include: { bus: { include: { cabinLayout: true } } } });
  if (!trip) throw httpError(404, "Trip not found");

  // Run Lua acquire
  const { acquireSha } = await getShas();
  const result = (await redis.evalsha(acquireSha, keys.length, ...keys, actorId, String(ttl))) as [number, number];
  if (result[0] !== 1) {
    const failedIdx = result[1] ?? 1;
    throw httpError(409, `Seat ${seatLabels[failedIdx - 1] ?? ""} is no longer available`, { code: "SEAT_TAKEN" });
  }

  // Open PG transaction
  try {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + ttl * 1000);

    // Check and lock all seats (optimistic concurrency via version)
    const updated = await prisma.$transaction(async (tx) => {
      const found = await tx.tripSeat.findMany({
        where: { tripId, seatLabel: { in: seatLabels }, status: "available" },
      });
      if (found.length !== seatLabels.length) {
        // release Redis locks
        throw httpError(409, "One or more seats were booked just now. Please re-select.", { code: "SEAT_TAKEN_RACE" });
      }

      await tx.tripSeat.updateMany({
        where: { tripId, seatLabel: { in: seatLabels }, status: "available" },
        data: { status: "locked", lockedBy: actorId, lockedUntil: lockExpiry, version: { increment: 1 } },
      });

      const counterUser = channel === "bookie" ? await tx.user.findUnique({ where: { id: actorId } }) : null;

      // Create PENDING_PAYMENT booking (if customer is logged in)
      const booking = await tx.booking.create({
        data: {
          pnr: generatePnr(),
          userId: channel === "online" ? actorId : null,
          tripId,
          counterId: counterUser?.counterId ?? null,
          channel: channel as any,
          status: "PENDING_PAYMENT",
          totalFare: trip.fare.mul(seatLabels.length),
          netPayable: trip.fare.mul(seatLabels.length),
          passengerCount: seatLabels.length,
          seatLabels,
          contactPhone: "",
        },
      });
      return { bookingId: booking.id, pnr: booking.pnr, expiresAt: lockExpiry };
    });

    return { success: true, ...updated, failedSeats: [] as string[] };
  } catch (e) {
    // Rollback Redis locks
    const { releaseSha } = await getShas();
    await redis.evalsha(releaseSha, keys.length, ...keys, actorId).catch(() => {});
    throw e;
  }
}

export async function releaseSeats(tripId: string, seatLabels: string[], actorId: string) {
  const { releaseSha } = await getShas();
  const keys = seatLabels.map((l) => `seat_lock:${tripId}:${l}`);
  await redis.evalsha(releaseSha, keys.length, ...keys, actorId);
  await prisma.tripSeat.updateMany({
    where: { tripId, seatLabel: { in: seatLabels }, lockedBy: actorId, status: "locked" },
    data: { status: "available", lockedBy: null, lockedUntil: null },
  });
}

/**
 * Get current states of seats for a trip, merging Redis lock state with PG state.
 * Returns Record<seatLabel, 0|1|2|3> where 0=available, 1=locked-by-you, 2=locked-by-other, 3=booked.
 */
export async function getSeatStates(tripId: string, actorId?: string): Promise<Record<string, number>> {
  const pg = await prisma.tripSeat.findMany({ where: { tripId } });
  const states: Record<string, number> = {};
  for (const s of pg) {
    if (s.status === "booked") states[s.seatLabel] = 3;
    else if (s.status === "held_crew") states[s.seatLabel] = 3;
    else if (s.status === "locked") states[s.seatLabel] = s.lockedBy === actorId ? 1 : 2;
    else states[s.seatLabel] = 0;
  }
  return states;
}

function generatePnr(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const block = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  const tail = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `YS-${block}-${tail}`;
}
