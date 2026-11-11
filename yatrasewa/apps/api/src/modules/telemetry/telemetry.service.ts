import { prisma } from "@yatrasewa/database";
import { redis } from "../../config/redis.js";
import type { GpsPing } from "@yatrasewa/shared-types";

const LIVE_KEY_PREFIX = "bus:live:";

export async function ingestGpsPing(ping: GpsPing & { operatorId?: string }) {
  // Update Redis live state
  await redis.hset(
    `${LIVE_KEY_PREFIX}${ping.tripId}`,
    "lat", ping.lat,
    "lng", ping.lng,
    "speed", ping.speedKmh,
    "heading", ping.headingDeg,
    "accuracy", ping.accuracyM,
    "lastUpdate", Date.now(),
    "busId", ping.busId,
    "operatorId", ping.operatorId ?? "",
  );
  await redis.expire(`${LIVE_KEY_PREFIX}${ping.tripId}`, 3600);

  // Queue for batch flush (in production BullMQ batches every 30s; here we inline for simplicity)
  await prisma.tripGpsTelemetry.create({
    data: {
      tripId: ping.tripId,
      busId: ping.busId,
      recordedAt: new Date(ping.timestamp),
      lat: ping.lat,
      lng: ping.lng,
      speedKmh: ping.speedKmh,
      headingDeg: ping.headingDeg,
      accuracyM: ping.accuracyM,
      source: ping.source,
    },
  }).catch(() => {});

  return { ok: true };
}

export async function getLiveState(tripId: string) {
  const d = await redis.hgetall(`${LIVE_KEY_PREFIX}${tripId}`);
  if (!d || !d.lat) return null;
  return {
    tripId,
    busId: d.busId!,
    lat: parseFloat(d.lat!),
    lng: parseFloat(d.lng!),
    speedKmh: parseFloat(d.speed ?? "0"),
    headingDeg: parseFloat(d.heading ?? "0"),
    lastUpdate: new Date(parseInt(d.lastUpdate ?? String(Date.now()))),
  };
}
