import { Server } from "socket.io";
import { Server as HttpServer } from "http";

import { webSocketManager } from "./websocket.manager";

export function initializeWebSocket(
  httpServer: HttpServer,
): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  webSocketManager.initialize(io);

  console.log("🔌 WebSocket server initialized");

  return io;
}