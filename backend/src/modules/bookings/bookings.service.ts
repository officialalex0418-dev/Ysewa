import { prisma } from "@yatrasewa/database";
import { redis } from "../../config/redis.js";
import { httpError } from "../../middlewares/error-handler.js";
import { DEFAULT_CANCEL_POLICY, formatNpr } from "@yatrasewa/shared-types";
import { loadSeatLockScripts } from "../../config/redis.js";
import crypto from "crypto";
import { env } from "../../config/env.js";

async function releaseRedisLocks(tripId: string, seats: string[], actorId: string) {
  const { releaseSha } = await loadSeatLockScripts();
  const keys = seats.map((l) => `seat_lock:${tripId}:${l}`);
  await redis.evalsha(releaseSha, keys.length, ...keys, actorId).catch(() => {});
}

export async function confirmBooking(bookingId: string, gatewayTxnId?: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { trip: true } });
  if (!b) throw httpError(404, "Booking not found");
  if (b.status !== "PENDING_PAYMENT") return b;

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: "CONFIRMED", confirmedAt: new Date() },
    });
    await tx.tripSeat.updateMany({
      where: { tripId: b.tripId, seatLabel: { in: b.seatLabels }, lockedBy: b.userId ?? gatewayTxnId },
      data: { status: "booked", lockedBy: null, lockedUntil: null },
    });
    await tx.trip.update({
      where: { id: b.tripId },
      data: { availableSeats: { decrement: b.passengerCount } },
    });
    if (gatewayTxnId) {
      await tx.paymentTransaction.create({
        data: {
          bookingId,
          gateway: "esewa",
          amount: b.netPayable,
          gatewayTransactionId: gatewayTxnId,
          status: "COMPLETED",
          verified: true,
          verifiedAt: new Date(),
        },
      });
    }
  });
  return prisma.booking.findUniqueOrThrow({ where: { id: bookingId }, include: { trip: { include: { operator: true, route: { include: { originCity: true, destCity: true } } } }, passengers: true } });
}

export async function cancelBooking(bookingId: string, userId: string, reason: string) {
  const b = await prisma.booking.findUnique({ where: { id: bookingId }, include: { trip: true } });
  if (!b) throw httpError(404, "Booking not found");
  if (b.userId && b.userId !== userId) throw httpError(403, "Not your booking");
  if (b.status !== "CONFIRMED" && b.status !== "PENDING_PAYMENT") throw httpError(400, "Booking cannot be cancelled");

  // Calculate refund based on hours until departure
  const hoursUntil = (new Date(b.trip.departureTime).getTime() - Date.now()) / 3600000;
  let refundPercent = 0;
  for (const p of DEFAULT_CANCEL_POLICY) {
    if (hoursUntil >= p.hoursBefore) { refundPercent = p.refundPercent; break; }
  }
  const refund = +(Number(b.netPayable) * refundPercent / 100).toFixed(2);
  const fee = +(Number(b.netPayable) - refund).toFixed(2);

  await prisma.$transaction(async (tx) => {
    await tx.booking.update({
      where: { id: bookingId },
      data: { status: refund > 0 ? "REFUNDED" : "CANCELLED", cancelledAt: new Date(), cancellationReason: reason },
    });
    await tx.tripSeat.updateMany({
      where: { tripId: b.tripId, seatLabel: { in: b.seatLabels } },
      data: { status: "available", lockedBy: null, lockedUntil: null, bookingId: null },
    });
    await tx.trip.update({
      where: { id: b.tripId },
      data: { availableSeats: { increment: b.passengerCount } },
    });
  });

  await releaseRedisLocks(b.tripId, b.seatLabels, userId);
  return { bookingId, refund, fee, refundPercent };
}

export async function getBookingByPnr(pnr: string, userId?: string) {
  const b = await prisma.booking.findUnique({
    where: { pnr },
    include: { trip: { include: { operator: true, route: { include: { originCity: true, destCity: true, stops: true } }, bus: true } }, passengers: true, payments: true },
  });
  if (!b) throw httpError(404, "Booking not found");
  if (userId && b.userId && b.userId !== userId) throw httpError(403, "Not your booking");
  return b;
}

export async function listMyBookings(userId: string) {
  return prisma.booking.findMany({
    where: { userId },
    include: { trip: { include: { operator: true, route: { include: { originCity: true, destCity: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}

export function signQrPayload(pnr: string): { qrText: string; sig: string } {
  const nonce = crypto.randomBytes(8).toString("hex");
  const msg = `yatrasewa:v1:${pnr}:${nonce}`;
  const sig = crypto.createHmac("sha256", env.ticketQrHmacSecret).update(msg).digest("hex");
  return { qrText: `${msg}?sig=${sig}`, sig };
}

export function verifyQrSignature(qrText: string): { pnr: string; valid: boolean } {
  try {
    const [msg, sigParam] = qrText.split("?sig=");
    if (!msg || !sigParam) return { pnr: "", valid: false };
    const parts = msg.split(":");
    const pnr = parts[3]!;
    const expected = crypto.createHmac("sha256", env.ticketQrHmacSecret).update(msg).digest("hex");
    const valid = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sigParam));
    return { pnr, valid };
  } catch { return { pnr: "", valid: false }; }
}

export { formatNpr };
