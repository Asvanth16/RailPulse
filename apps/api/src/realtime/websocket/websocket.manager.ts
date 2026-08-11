import { Server, Socket } from "socket.io";
import { WebSocketRooms } from "./websocket.rooms";
import { WebSocketEvent } from "./websocket.types";
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

  private eventCounts: Record<WebSocketEvent, number> = {
    "connection:ready": 0,
    "subscription:success": 0,
    "subscription:error": 0,
    "train:updated": 0,
    "train:delay_updated": 0,
    "train:platform_changed": 0,
    "train:cancelled": 0,
    "alert:triggered": 0,
  };

  private lastEvent: WebSocketEvent | null = null;

  private lastEventAt: string | null = null;

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

  getStatus(): {
    initialized: boolean;
    connectedClients: number;
  } {
    return {
      initialized: this.io !== null,
      connectedClients: this.getConnectedClientCount(),
    };
  }

  getSubscriptionStatus(): {
    trainSubscriptions: {
      trainNumber: string;
      clientCount: number;
    }[];

    userSubscriptions: {
      userId: string;
      clientCount: number;
    }[];
  } {
    if (!this.io) {
      return {
        trainSubscriptions: [],
        userSubscriptions: [],
      };
    }

    const rooms = this.io.sockets.adapter.rooms;

    const trainSubscriptions: {
      trainNumber: string;
      clientCount: number;
    }[] = [];

    const userSubscriptions: {
      userId: string;
      clientCount: number;
    }[] = [];

    for (const [room, sockets] of rooms) {
      if (room.startsWith("train:")) {
        trainSubscriptions.push({
          trainNumber: room.substring("train:".length),
          clientCount: sockets.size,
        });

        continue;
      }

      if (room.startsWith("user:")) {
        userSubscriptions.push({
          userId: room.substring("user:".length),
          clientCount: sockets.size,
        });
      }
    }

    return {
      trainSubscriptions,
      userSubscriptions,
    };
  }

  recordEvent(event: WebSocketEvent): void {
    this.eventCounts[event] += 1;

    this.lastEvent = event;
    this.lastEventAt = new Date().toISOString();
  }

  getEventStatus(): {
    totalEvents: number;
    eventsByType: Record<WebSocketEvent, number>;
    lastEvent: WebSocketEvent | null;
    lastEventAt: string | null;
  } {
    const totalEvents = Object.values(this.eventCounts).reduce(
      (total, count) => total + count,
      0,
    );

    return {
      totalEvents,
      eventsByType: {
        ...this.eventCounts,
      },
      lastEvent: this.lastEvent,
      lastEventAt: this.lastEventAt,
    };
  }

  
}

export const webSocketManager = new WebSocketManager();
