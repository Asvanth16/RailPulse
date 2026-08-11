export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface OperationsOverview {
  service: string;
  status: string;
  environment: string;
  nodeVersion: string;
  uptimeSeconds: number;
  generatedAt: string;
}

export interface SystemStatus {
  service: string;
  status: string;
  environment: string;
  nodeVersion: string;
  uptimeSeconds: number;
  generatedAt: string;
}

export interface SchedulerJobStatus {
  name: string;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastSuccess: boolean | null;
  lastError: string | null;
}

export interface SchedulerStatus {
  isRunning: boolean;
  pollingIntervalMs: number;
  lastCycleStartedAt: string | null;
  lastCycleCompletedAt: string | null;
  jobs: SchedulerJobStatus[];
}

export interface WebSocketStatus {
  status: string;
  initialized: boolean;
  connectedClients: number;
}

export interface WebSocketTrainSubscription {
  trainNumber: string;
  clientCount: number;
}

export interface WebSocketUserSubscription {
  userId: string;
  clientCount: number;
}

export interface WebSocketSubscriptions {
  trainSubscriptions: WebSocketTrainSubscription[];
  userSubscriptions: WebSocketUserSubscription[];
  totalTrainSubscriptions: number;
  totalUserSubscriptions: number;
}

export interface WebSocketEventStatus {
  totalEvents: number;
  eventsByType: Record<string, number>;
  lastEvent: string | null;
  lastEventAt: string | null;
}

export interface LiveTrain {
  stationEva: number;

  plannedArrival?: string;
  actualArrival?: string;

  plannedDeparture?: string;
  actualDeparture?: string;

  plannedPlatform?: number;
  actualPlatform?: number;

  arrivalDelayMinutes?: number;
  departureDelayMinutes?: number;

  cancelled: boolean;

  train: {
    trainNumber: number | string;
    category: string;
    operator: string;
    flags?: string;
    tripType?: string;
  };

  messages?: {
    id: string;
    type: string;
    text: string;
    priority?: string;
  }[];
}

export interface LiveTrainsResponse {
  stationEva: number | null;
  count: number;
  trains: LiveTrain[];
}

export type AlertType =
  | "DELAY"
  | "PLATFORM_CHANGE"
  | "CANCELLATION"
  | "DEPARTURE_REMINDER"
  | "ARRIVAL_REMINDER";

export interface OperationsAlert {
  id: string;
  alertType: AlertType;

  trainNumber: string | null;

  monitorStationEva: number | null;
  monitorStationName: string | null;

  isEnabled: boolean;
  isTriggered: boolean;

  lastCheckedAt: string | null;
  lastTriggeredAt: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface AlertStatistics {
  total: number;
  enabled: number;
  triggered: number;
  disabled: number;

  byType: {
    DELAY: number;
    PLATFORM_CHANGE: number;
    CANCELLATION: number;
    DEPARTURE_REMINDER: number;
    ARRIVAL_REMINDER: number;
  };
}
