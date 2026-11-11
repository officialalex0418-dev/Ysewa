import { Redis } from "ioredis";
import { env } from "./env.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const redis = new Redis(env.redisUrl, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

redis.on("error", (err) => console.error("[redis] error", err.message));
redis.on("connect", () => console.log("[redis] connected"));

let scriptsLoaded = false;

export async function loadSeatLockScripts(): Promise<{ acquireSha: string; releaseSha: string }> {
  if (scriptsLoaded) {
    const a = await redis.get("seat-lock:acquire:sha");
    const r = await redis.get("seat-lock:release:sha");
    return { acquireSha: a as string, releaseSha: r as string };
  }
  const acquireSrc = readFileSync(join(__dirname, "..", "lua", "acquire-seats.lua"), "utf8");
  const releaseSrc = readFileSync(join(__dirname, "..", "lua", "release-seats.lua"), "utf8");
  const acquireSha = (await redis.script("LOAD", acquireSrc)) as string;
  const releaseSha = (await redis.script("LOAD", releaseSrc)) as string;
  await redis.set("seat-lock:acquire:sha", acquireSha);
  await redis.set("seat-lock:release:sha", releaseSha);
  scriptsLoaded = true;
  return { acquireSha, releaseSha };
}
