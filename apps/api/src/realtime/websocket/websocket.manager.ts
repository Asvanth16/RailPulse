import { Server, Socket } from "socket.io";
import { WebSocketRooms } from "./websocket.rooms";

import {
  ConnectionReadyPayload,
  SubscribeTrainPayload,
  SubscriptionErrorPayload,
  SubscriptionSuccessPayload,
  SubscribeUserPayload,
  UserSubscriptionSuccessPayload,
  WebSocketEventPayload,
} from "./websocket.types";

export class WebSocketManager {
  private io: Server | null = null;

  initialize(io: Server): void {
    this.io = io;

    console.log("🔌 WebSocket Manager initialized");

    this.io.on("connection", (socket: Socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    console.log(`🔌 WebSocket client connected: ${socket.id}`);

    const payload: WebSocketEventPayload<ConnectionReadyPayload> = {
      event: "connection:ready",
      data: {
        socketId: socket.id,
        connectedAt: new Date().toISOString(),
      },
    };

    socket.on("subscribe:train", (payload: SubscribeTrainPayload) => {
      this.subscribeToTrain(socket, payload);
    });

    socket.on("subscribe:user", (payload: SubscribeUserPayload) => {
      this.subscribeToUser(socket, payload);
    });

    socket.emit("connection:ready", payload.data);

    socket.on("disconnect", (reason: string) => {
      this.handleDisconnect(socket, reason);
    });
  }

  private handleDisconnect(socket: Socket, reason: string): void {
    console.log(`🔌 WebSocket client disconnected: ${socket.id} (${reason})`);
  }

  private subscribeToTrain(
    socket: Socket,
    payload: SubscribeTrainPayload,
  ): void {
    const trainNumber = payload?.trainNumber?.trim();

    if (!trainNumber) {
      const error: SubscriptionErrorPayload = {
        message: "Train number is required.",
      };

      socket.emit("subscription:error", error);

      return;
    }

    const room = WebSocketRooms.train(trainNumber);

    socket.join(room);

    console.log(`📡 Client ${socket.id} subscribed to train ${trainNumber}`);

    const response: SubscriptionSuccessPayload = {
      subscription: "train",
      trainNumber,
      room,
    };

    socket.emit("subscription:success", response);
  }

  private subscribeToUser(socket: Socket, payload: SubscribeUserPayload): void {
    const userId = payload?.userId?.trim();

    if (!userId) {
      socket.emit("subscription:error", {
        message: "User ID is required.",
      });

      return;
    }

    const room = WebSocketRooms.user(userId);

    socket.join(room);

    console.log(`📡 Client ${socket.id} subscribed to user ${userId}`);

    const response: UserSubscriptionSuccessPayload = {
      subscription: "user",
      userId,
      room,
    };

    socket.emit("subscription:success", response);
  }

  getServer(): Server {
    if (!this.io) {
      throw new Error("WebSocket server has not been initialized.");
    }

    return this.io;
  }

  getConnectedClientCount(): number {
    if (!this.io) {
      return 0;
    }

    return this.io.sockets.sockets.size;
  }
}

export const webSocketManager = new WebSocketManager();
