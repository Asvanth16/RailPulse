import { webSocketManager } from "./websocket.manager";
import { WebSocketRooms } from "./websocket.rooms";

import {
  AlertTriggeredPayload,
  WebSocketEventPayload,
} from "./websocket.types";

export class WebSocketAlertPublisher {
  publishAlertTriggered(userId: string, payload: AlertTriggeredPayload): void {
    const event: WebSocketEventPayload<AlertTriggeredPayload> = {
      event: "alert:triggered",
      data: payload,
    };

    webSocketManager
      .getServer()
      .to(WebSocketRooms.user(userId))
      .emit("alert:triggered", event.data);

    webSocketManager.recordEvent("alert:triggered");

    console.log(
      `🔔 WebSocket alert published: ${payload.alertType} → user ${userId}`,
    );
  }
}

export const webSocketAlertPublisher = new WebSocketAlertPublisher();
