import { redis, loadSeatLockScripts } from "../../config/redis.js";
import { env } from "../../config/env.js";
import { httpError } from "../../middlewares/error-handler.js";
import mongoose from "mongoose";
import { Trip } from "../../models/Trip.js";
import { TripSeat } from "../../models/TripSeat.js";
import { Booking } from "../../models/Booking.js";
import { User } from "../../models/User.js";

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

export async function acquireSeats(input: LockSeatsInput) {
  const { tripId, seatLabels, actorId, channel } = input;
  const ttl = channel === "online" ? env.seatLockTtlOnline : channel === "bookie" ? env.seatLockTtlBookie : 30;
  const keys = seatLabels.map((l) => `seat_lock:${tripId}:${l}`);

  // Check trip exists
  const trip = await Trip.findById(tripId).populate("busId").lean();
  if (!trip) throw httpError(404, "Trip not found");

  // Run Lua acquire
  const { acquireSha } = await getShas();
  const result = (await redis.evalsha(acquireSha, keys.length, ...keys, actorId, String(ttl))) as [number, number];
  if (result[0] !== 1) {
    const failedIdx = result[1] ?? 1;
    throw httpError(409, `Seat ${seatLabels[failedIdx - 1] ?? ""} is no longer available`, { code: "SEAT_TAKEN" });
  }

  // Open PG transaction
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();
    const lockExpiry = new Date(now.getTime() + ttl * 1000);

    const found = await TripSeat.find({
        tripId, seatLabel: { $in: seatLabels }, status: "available"
    }).session(session);

    if (found.length !== seatLabels.length) {
      // release Redis locks
      throw httpError(409, "One or more seats were booked just now. Please re-select.", { code: "SEAT_TAKEN_RACE" });
    }

    await TripSeat.updateMany({
        tripId, seatLabel: { $in: seatLabels }, status: "available"
    }, {
        $set: { status: "locked", lockedBy: actorId, lockedUntil: lockExpiry },
        $inc: { version: 1 }
    }, { session });

    const counterUser = channel === "bookie" ? await User.findById(actorId).session(session) : null;

    // Create PENDING_PAYMENT booking
    const booking = await Booking.create([{
        pnr: generatePnr(),
        userId: channel === "online" ? actorId : undefined,
        tripId,
        operatorId: trip.operatorId,
        counterId: counterUser?.counterId,
        channel,
        status: "PENDING_PAYMENT",
        totalFare: trip.fare * seatLabels.length,
        netPayable: trip.fare * seatLabels.length,
        passengerCount: seatLabels.length,
        seatLabels,
        contactPhone: "", // Requires filling during checkout
    }], { session });

    await session.commitTransaction();

    return { success: true, bookingId: booking[0]._id, pnr: booking[0].pnr, expiresAt: lockExpiry, failedSeats: [] as string[] };
  } catch (e) {
    await session.abortTransaction();
    const { releaseSha } = await getShas();
    await redis.evalsha(releaseSha, keys.length, ...keys, actorId).catch(() => {});
    throw e;
  } finally {
      session.endSession();
  }
}

export async function releaseSeats(tripId: string, seatLabels: string[], actorId: string) {
  const { releaseSha } = await getShas();
  const keys = seatLabels.map((l) => `seat_lock:${tripId}:${l}`);
  await redis.evalsha(releaseSha, keys.length, ...keys, actorId);
  await TripSeat.updateMany(
    { tripId, seatLabel: { $in: seatLabels }, lockedBy: actorId, status: "locked" },
    { $set: { status: "available", lockedBy: null, lockedUntil: null } }
  );
}

export async function getSeatStates(tripId: string, actorId?: string): Promise<Record<string, number>> {
  const pg = await TripSeat.find({ tripId }).lean();
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
