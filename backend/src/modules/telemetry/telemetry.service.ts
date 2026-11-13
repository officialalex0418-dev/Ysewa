// @ts-nocheck
import { redis } from "../../config/redis.js";
import type { GpsPing } from "../../types/index.js";

const LIVE_KEY_PREFIX = "bus:live:";

export async function ingestGpsPing(ping: GpsPing & { operatorId?: string }) {
  await redis.hset(
    `${LIVE_KEY_PREFIX}${ping.tripId}`,
    "lat", ping.lat,
    "lng", ping.lng,
    "lastUpdate", Date.now(),
  ).catch(() => {});
  await redis.expire(`${LIVE_KEY_PREFIX}${ping.tripId}`, 3600).catch(() => {});
  return { ok: true };
}

export async function getLiveState(tripId: string) {
  const d = await redis.hgetall(`${LIVE_KEY_PREFIX}${tripId}`).catch(() => null);
  if (!d || !d.lat) return null;
  return {
    tripId,
    lat: parseFloat(d.lat),
    lng: parseFloat(d.lng),
    lastUpdate: new Date(parseInt(d.lastUpdate || String(Date.now()))),
  };
}
