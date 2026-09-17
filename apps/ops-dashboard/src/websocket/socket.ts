import { io, Socket } from "socket.io-client";

import type {
  ConnectionReadyPayload,
  OperationsWebSocketEvent,
  SubscriptionErrorPayload,
  SubscriptionSuccessPayload,
  TrainCancelledEvent,
  TrainDelayUpdatedEvent,
  TrainPlatformChangedEvent,
  TrainUpdatedEvent,
} from "./websocket.types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const socket: Socket = io(API_URL, {
  autoConnect: false,

  transports: ["websocket"],
});

// =========================
// Connect
// =========================

export function connectWebSocket(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

// =========================
// Disconnect
// =========================

export function disconnectWebSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}

// =========================
// Subscribe to Operations
// =========================

export function subscribeToOperations(): void {
  if (!socket.connected) {
    return;
  }

  socket.emit("subscribe:operations", {});
}

// =========================
// Connection Ready
// =========================

export function onConnectionReady(
  handler: (payload: ConnectionReadyPayload) => void,
): () => void {
  socket.on("connection:ready", handler);

  return () => {
    socket.off("connection:ready", handler);
  };
}

// =========================
// Subscription Success
// =========================

export function onSubscriptionSuccess(
  handler: (payload: SubscriptionSuccessPayload) => void,
): () => void {
  socket.on("subscription:success", handler);

  return () => {
    socket.off("subscription:success", handler);
  };
}

// =========================
// Subscription Error
// =========================

export function onSubscriptionError(
  handler: (payload: SubscriptionErrorPayload) => void,
): () => void {
  socket.on("subscription:error", handler);

  return () => {
    socket.off("subscription:error", handler);
  };
}

// =========================
// Operations Events
// =========================

export function onOperationsEvent(
  handler: (event: OperationsWebSocketEvent) => void,
): () => void {
  const handleTrainUpdated = (data: TrainUpdatedEvent): void => {
    handler({
      type: "train:updated",
      data,
    });
  };

  const handleDelayUpdated = (data: TrainDelayUpdatedEvent): void => {
    handler({
      type: "train:delay_updated",
      data,
    });
  };

  const handlePlatformChanged = (data: TrainPlatformChangedEvent): void => {
    handler({
      type: "train:platform_changed",
      data,
    });
  };

  const handleCancelled = (data: TrainCancelledEvent): void => {
    handler({
      type: "train:cancelled",
      data,
    });
  };

  socket.on("train:updated", handleTrainUpdated);

  socket.on("train:delay_updated", handleDelayUpdated);

  socket.on("train:platform_changed", handlePlatformChanged);

  socket.on("train:cancelled", handleCancelled);

  return () => {
    socket.off("train:updated", handleTrainUpdated);

    socket.off("train:delay_updated", handleDelayUpdated);

    socket.off("train:platform_changed", handlePlatformChanged);

    socket.off("train:cancelled", handleCancelled);
  };
}
