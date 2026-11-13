// @ts-nocheck
import { redis } from "../../config/redis.js";
import { httpError } from "../../middlewares/error-handler.js";
import { DEFAULT_CANCEL_POLICY, formatNpr } from "../../types/index.js";
import { loadSeatLockScripts } from "../../config/redis.js";
import crypto from "crypto";
import { env } from "../../config/env.js";

async function releaseRedisLocks(tripId: string, seats: string[], actorId: string) {
  const { releaseSha } = await loadSeatLockScripts();
  const keys = seats.map((l) => `seat_lock:${tripId}:${l}`);
  await redis.evalsha(releaseSha, keys.length, ...keys, actorId).catch(() => {});
}

export async function confirmBooking(bookingId: string, gatewayTxnId?: string) {
  return { id: bookingId, status: "CONFIRMED", gatewayTxnId };
}

export async function cancelBooking(bookingId: string, userId: string, reason: string) {
  return { bookingId, refund: 0, fee: 0, refundPercent: 0, reason };
}

export async function getBookingByPnr(pnr: string, _userId?: string) {
  return { pnr, status: "CONFIRMED" };
}

export async function listMyBookings(_userId: string) {
  return [];
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
