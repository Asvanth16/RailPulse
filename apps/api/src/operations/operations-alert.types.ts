import { AlertType } from "../generated/prisma/enums";

export type OperationalAlertSeverity = "CRITICAL" | "WARNING" | "INFO";

export interface OperationsAlertDto {
  id: string;

  alertType: AlertType;

  severity: OperationalAlertSeverity;

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
