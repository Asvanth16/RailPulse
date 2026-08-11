import { AlertType } from "../generated/prisma/enums";

export interface OperationsAlertDto {
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