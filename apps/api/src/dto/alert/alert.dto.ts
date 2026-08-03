export interface AlertDto {
  id: string;

  trainNumber?: string;

  journeyId?: string;

  fromStationEva?: number;
  fromStationName?: string;

  toStationEva?: number;
  toStationName?: string;

  alertType:
    | "DELAY"
    | "PLATFORM_CHANGE"
    | "CANCELLATION"
    | "DEPARTURE_REMINDER"
    | "ARRIVAL_REMINDER";

  isEnabled: boolean;
  isTriggered: boolean;

  lastCheckedAt?: string;

  createdAt: string;
  updatedAt: string;
}