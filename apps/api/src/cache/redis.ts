import { createClient } from "redis";

import { env } from "../config/env";

export const redis = createClient({
  socket: {
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
  },

  password: env.REDIS_PASSWORD || undefined,
});

redis.on("connect", () => {
  console.log("🔗 Connecting to Redis...");
});

redis.on("ready", () => {
  console.log("✅ Redis connected");
});

redis.on("error", (error) => {
  console.error("❌ Redis error:", error);
});

redis.on("reconnecting", () => {
  console.log("🔄 Reconnecting to Redis...");
});

export async function connectRedis(): Promise<void> {
  if (!redis.isOpen) {
    await redis.connect();
  }
}