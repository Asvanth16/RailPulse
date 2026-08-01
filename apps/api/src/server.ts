import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectRedis } from "./cache/redis";

await connectRedis();

app.listen(env.PORT, () => {
  logger.info(`RailPulse API running on port ${env.PORT}`);
});