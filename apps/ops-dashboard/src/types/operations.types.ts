/* =========================
   Generic API Response
========================= */

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/* =========================
   Operations Overview
========================= */

export interface OperationsOverview {
  service: string;
}

/* =========================
   System
========================= */

export interface SystemStatus {
  service: string;
  status: string;
  environment: string;
  nodeVersion: string;
  uptimeSeconds: number;
  generatedAt: string;
}

/* =========================
   Scheduler
========================= */

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

/* =========================
   WebSocket
========================= */

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

/* =========================
   Operations Stations
========================= */

/**
 * Station returned directly from the
 * Deutsche Bahn station search.
 */
export interface OperationsStation {
  eva: number;
  ds100: string;
  name: string;
}

/**
 * Station explicitly selected by
 * Operations for realtime monitoring.
 */
export interface OperationsMonitoredStation {
  id: string;
  eva: number;
  ds100: string;
  name: string;
  isEnabled: boolean;
}

/**
 * Response returned by the monitored
 * stations endpoint.
 */
export interface OperationsMonitoredStationsResponse {
  stations: OperationsMonitoredStation[];
}

/* =========================
   Live Trains
========================= */

export interface LiveTrain {
  stationEva: number;

  plannedArrival?: string;
  actualArrival?: string;

  plannedDeparture?: string;
  actualDeparture?: string;

  plannedPlatform?: number | string;
  actualPlatform?: number | string;

  arrivalDelayMinutes?: number;
  departureDelayMinutes?: number;

  cancelled: boolean;

  /**
   * Stations before the current station.
   */
  previousStations?: string[];

  /**
   * Stations after the current station.
   */
  nextStations?: string[];

  /**
   * Best-effort origin station.
   */
  origin?: string;

  /**
   * Best-effort final destination.
   */
  destination?: string;

  train: {
    trainNumber: number | string;
    category: string;
    operator: string;
    flags?: string;
    tripType?: string;
  };

  messages?: LiveTrainMessage[];
}

export interface LiveTrainMessage {
  id: string;
  type: string;
  text: string;
  priority?: string;
}

export interface LiveTrainsResponse {
  stationEva: number | null;
  count: number;
  trains: LiveTrain[];
}

/* =========================
   Operational Updates
========================= */

export type OperationalUpdateType =
  "DELAY_CHANGED" | "PLATFORM_CHANGED" | "CANCELLED" | "STATUS_CHANGED";

export interface OperationalUpdate {
  id: string;
  type: OperationalUpdateType;
  trainNumber: string;
  category: string;
  stationEva: number;

  previousValue?: string | number | boolean | null;

  currentValue?: string | number | boolean | null;

  message: string;
  detectedAt: string;
}

/* =========================
   Operational History
========================= */

export type OperationalHistoryType =
  "DELAY_CHANGED" | "PLATFORM_CHANGED" | "CANCELLATION" | "STATUS_CHANGED";

export interface OperationalHistoryEntry {
  id: string;
  trainNumber: string;
  trainRunId: string;

  type: OperationalHistoryType;

  previousValue: string | null;
  currentValue: string | null;

  message: string;

  occurredAt: string;
  createdAt: string;

  stationEva: number | null;
}

export interface RecentOperationalHistoryEntry
  extends OperationalHistoryEntry {
  category: string;
}
