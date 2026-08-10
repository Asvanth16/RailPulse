import http from "http";

import app from "./app";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { connectRedis } from "./cache/redis";
import { scheduler } from "./realtime/scheduler/scheduler";
import { initializeWebSocket } from "./realtime/websocket/websocket.server";

const httpServer = http.createServer(app);

await connectRedis();

const startServer = async (): Promise<void> => {
  initializeWebSocket(httpServer);

  httpServer.listen(env.PORT, async () => {
    logger.info(`RailPulse API running on port ${env.PORT}`);

    await scheduler.start();
  });
};

await startServer();