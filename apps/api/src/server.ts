import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectRedis } from "./cache/redis";
import { scheduler } from "./realtime/scheduler/scheduler";

await connectRedis();

app.listen(env.PORT, async () => {
  logger.info(`RailPulse API running on port ${env.PORT}`);

  await scheduler.start();
});