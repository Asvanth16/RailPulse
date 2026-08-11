export type WebSocketEvent =
  | "connection:ready"
  | "subscription:success"
  | "subscription:error"
  | "train:updated"
  | "train:delay_updated"
  | "train:platform_changed"
  | "train:cancelled"
  | "alert:triggered";

export interface ConnectionReadyPayload {
  socketId: string;
  connectedAt: string;
}

export interface TrainUpdatedPayload {
  trainNumber: string;
  category: string;

  stationEva: number;

  plannedArrival: string | null;
  actualArrival: string | null;

  plannedDeparture: string | null;
  actualDeparture: string | null;

  arrivalDelayMinutes: number;
  departureDelayMinutes: number;

  plannedPlatform: string | null;
  actualPlatform: string | null;

  cancelled: boolean;

  updatedAt: string;
}

export interface TrainDelayUpdatedPayload {
  trainNumber: string;

  stationEva: number;

  arrivalDelayMinutes: number;
  departureDelayMinutes: number;

  updatedAt: string;
}

export interface TrainPlatformChangedPayload {
  trainNumber: string;

  stationEva: number;

  plannedPlatform: string | null;
  actualPlatform: string | null;

  updatedAt: string;
}

export interface TrainCancelledPayload {
  trainNumber: string;

  stationEva: number;

  cancelled: boolean;

  updatedAt: string;
}

export interface SubscribeTrainPayload {
  trainNumber: string;
}

export interface SubscriptionSuccessPayload {
  subscription: "train";
  trainNumber: string;
  room: string;
}

export interface SubscriptionErrorPayload {
  message: string;
}

export interface AlertTriggeredPayload {
  alertId: string;

  alertType:
    | "DELAY"
    | "PLATFORM_CHANGE"
    | "CANCELLATION"
    | "DEPARTURE_REMINDER"
    | "ARRIVAL_REMINDER";

  trainNumber: string;

  stationEva: number | null;

  title: string;

  message: string;

  triggeredAt: string;
}

export interface SubscribeUserPayload {
  userId: string;
}

export interface UserSubscriptionSuccessPayload {
  subscription: "user";
  userId: string;
  room: string;
}

export interface WebSocketEventPayload<T = unknown> {
  event: WebSocketEvent;
  data: T;
}
