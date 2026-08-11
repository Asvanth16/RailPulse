export interface ConnectionReadyPayload {
  socketId: string;
  connectedAt: string;
}

export interface SubscribeTrainPayload {
  trainNumber: string;
}

export interface SubscriptionSuccessPayload {
  subscription: string;
  trainNumber: string;
  room: string;
}

export interface SubscriptionErrorPayload {
  message: string;
}

export interface TrainUpdatedEvent {
  trainNumber: string;

  category: string;

  stationEva: number;

  plannedArrival: string | null;
  actualArrival: string | null;

  plannedDeparture: string | null;
  actualDeparture: string | null;

  arrivalDelayMinutes: number;
  departureDelayMinutes: number;

  plannedPlatform: number | null;
  actualPlatform: number | null;

  cancelled: boolean;

  updatedAt: string;
}

export interface TrainDelayUpdatedEvent {
  trainNumber: string;
  stationEva: number;

  arrivalDelayMinutes: number;
  departureDelayMinutes: number;

  updatedAt: string;
}

export interface TrainPlatformChangedEvent {
  trainNumber: string;
  stationEva: number;

  plannedPlatform: string | null;
  actualPlatform: string | null;

  updatedAt: string;
}

export interface TrainCancelledEvent {
  trainNumber: string;
  stationEva: number;

  cancelled: boolean;

  updatedAt: string;
}

export interface AlertTriggeredEvent {
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