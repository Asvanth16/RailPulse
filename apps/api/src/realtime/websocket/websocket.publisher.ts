import { LiveStopDto } from "../../dto/live";

import { webSocketManager } from "./websocket.manager";

import {
  TrainUpdatedPayload,
  TrainDelayUpdatedPayload,
  TrainPlatformChangedPayload,
  TrainCancelledPayload,
  WebSocketEventPayload,
} from "./websocket.types";

import { WebSocketRooms } from "./websocket.rooms";

export class WebSocketPublisher {
  // =========================
  // Train Updated
  // =========================

  publishTrainUpdated(train: LiveStopDto): void {
    const trainNumber = String(train.train.trainNumber).trim();

    const payload: TrainUpdatedPayload = {
      trainNumber,

      category: train.train.category,

      stationEva: train.stationEva,

      plannedArrival: train.plannedArrival ?? null,

      actualArrival: train.actualArrival ?? null,

      plannedDeparture: train.plannedDeparture ?? null,

      actualDeparture: train.actualDeparture ?? null,

      arrivalDelayMinutes: train.arrivalDelayMinutes ?? 0,

      departureDelayMinutes: train.departureDelayMinutes ?? 0,

      plannedPlatform: train.plannedPlatform ?? null,

      actualPlatform: train.actualPlatform ?? null,

      cancelled: train.cancelled,

      updatedAt: new Date().toISOString(),
    };

    const event: WebSocketEventPayload<TrainUpdatedPayload> = {
      event: "train:updated",
      data: payload,
    };

    const io = webSocketManager.getServer();

    const trainRoom = WebSocketRooms.train(trainNumber);

    const operationsRoom = WebSocketRooms.operations();

    const trainRoomSize = io.sockets.adapter.rooms.get(trainRoom)?.size ?? 0;

    const operationsRoomSize =
      io.sockets.adapter.rooms.get(operationsRoom)?.size ?? 0;

    console.log(`📡 Publishing train update`);

    console.log(`   Train             : ${trainNumber}`);

    console.log(`   Station EVA       : ${train.stationEva}`);

    console.log(`   Train room clients: ${trainRoomSize}`);

    console.log(`   Operations clients: ${operationsRoomSize}`);

    console.log(`   Event             : ${event.event}`);

    // Train-specific subscribers.
    io.to(trainRoom).emit("train:updated", event.data);

    // Operations Dashboard subscribers.
    io.to(operationsRoom).emit("train:updated", event.data);

    webSocketManager.recordEvent("train:updated");

    console.log(`📡 WebSocket train update published: ${trainNumber}`);
  }

  // =========================
  // Delay Updated
  // =========================

  publishTrainDelayUpdated(train: LiveStopDto): void {
    const payload: TrainDelayUpdatedPayload = {
      trainNumber: String(train.train.trainNumber),

      stationEva: train.stationEva,

      arrivalDelayMinutes: train.arrivalDelayMinutes ?? 0,

      departureDelayMinutes: train.departureDelayMinutes ?? 0,

      updatedAt: new Date().toISOString(),
    };

    const event: WebSocketEventPayload<TrainDelayUpdatedPayload> = {
      event: "train:delay_updated",

      data: payload,
    };

    const io = webSocketManager.getServer();

    const trainRoom = WebSocketRooms.train(payload.trainNumber);

    const operationsRoom = WebSocketRooms.operations();

    io.to(trainRoom).emit("train:delay_updated", event.data);

    io.to(operationsRoom).emit("train:delay_updated", event.data);

    webSocketManager.recordEvent("train:delay_updated");

    console.log(`⏱️ WebSocket delay update published: ${payload.trainNumber}`);
  }

  // =========================
  // Platform Changed
  // =========================

  publishTrainPlatformChanged(train: LiveStopDto): void {
    const payload: TrainPlatformChangedPayload = {
      trainNumber: String(train.train.trainNumber),

      stationEva: train.stationEva,

      plannedPlatform: train.plannedPlatform ?? null,

      actualPlatform: train.actualPlatform ?? null,

      updatedAt: new Date().toISOString(),
    };

    const event: WebSocketEventPayload<TrainPlatformChangedPayload> = {
      event: "train:platform_changed",

      data: payload,
    };

    const io = webSocketManager.getServer();

    const trainRoom = WebSocketRooms.train(payload.trainNumber);

    const operationsRoom = WebSocketRooms.operations();

    io.to(trainRoom).emit("train:platform_changed", event.data);

    io.to(operationsRoom).emit("train:platform_changed", event.data);

    webSocketManager.recordEvent("train:platform_changed");

    console.log(
      `🚉 WebSocket platform update published: ${payload.trainNumber}`,
    );
  }

  // =========================
  // Cancelled
  // =========================

  publishTrainCancelled(train: LiveStopDto): void {
    const payload: TrainCancelledPayload = {
      trainNumber: String(train.train.trainNumber),

      stationEva: train.stationEva,

      cancelled: train.cancelled,

      updatedAt: new Date().toISOString(),
    };

    const event: WebSocketEventPayload<TrainCancelledPayload> = {
      event: "train:cancelled",

      data: payload,
    };

    const io = webSocketManager.getServer();

    const trainRoom = WebSocketRooms.train(payload.trainNumber);

    const operationsRoom = WebSocketRooms.operations();

    io.to(trainRoom).emit("train:cancelled", event.data);

    io.to(operationsRoom).emit("train:cancelled", event.data);

    webSocketManager.recordEvent("train:cancelled");

    console.log(
      `🚫 WebSocket cancellation update published: ${payload.trainNumber}`,
    );
  }
}

export const webSocketPublisher = new WebSocketPublisher();
