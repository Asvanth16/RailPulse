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
  publishTrainUpdated(train: LiveStopDto): void {
    const trainNumber = String(train.train.trainNumber).trim();

    const room = WebSocketRooms.train(trainNumber);

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

    const roomSize = io.sockets.adapter.rooms.get(room)?.size ?? 0;

    console.log(`📡 Publishing train update`);

    console.log(`   Train     : ${trainNumber}`);

    console.log(`   Room      : ${room}`);

    console.log(`   Clients   : ${roomSize}`);

    console.log(`   Event     : ${event.event}`);

    io.to(room).emit("train:updated", event.data);

    console.log(`📡 WebSocket train update published: ${trainNumber}`);
  }

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

    webSocketManager
      .getServer()
      .to(WebSocketRooms.train(payload.trainNumber))
      .emit("train:delay_updated", event.data);

    console.log(`⏱️ WebSocket delay update published: ${payload.trainNumber}`);
  }

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

    webSocketManager
      .getServer()
      .to(WebSocketRooms.train(payload.trainNumber))
      .emit("train:platform_changed", event.data);

    console.log(
      `🚉 WebSocket platform update published: ${payload.trainNumber}`,
    );
  }

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

    webSocketManager
      .getServer()
      .to(WebSocketRooms.train(payload.trainNumber))
      .emit("train:cancelled", event.data);

    console.log(
      `🚫 WebSocket cancellation update published: ${payload.trainNumber}`,
    );
  }
}

export const webSocketPublisher = new WebSocketPublisher();
