import { LiveStopDto } from "../../dto/live";

import { webSocketManager } from "./websocket.manager";
import { TrainUpdatedPayload, WebSocketEventPayload } from "./websocket.types";
import { WebSocketRooms } from "./websocket.rooms";

export class WebSocketPublisher {
  publishTrainUpdated(train: LiveStopDto): void {
    const payload: TrainUpdatedPayload = {
      trainNumber: train.train.trainNumber,
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

    webSocketManager
      .getServer()
      .to(WebSocketRooms.train(payload.trainNumber))
      .emit("train:updated", event.data);

    console.log(`📡 WebSocket train update published: ${payload.trainNumber}`);
  }
}

export const webSocketPublisher = new WebSocketPublisher();
