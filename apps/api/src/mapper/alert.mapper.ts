import { Alert } from "../generated/prisma/models";

import { AlertDto } from "../dto/alert";

export const alertMapper = {
  toDto(alert: Alert): AlertDto {
    return {
      id: alert.id,

      trainNumber: alert.trainNumber ?? undefined,

      journeyId: alert.journeyId ?? undefined,

      fromStationEva:
        alert.fromStationEva ?? undefined,

      fromStationName:
        alert.fromStationName ?? undefined,

      toStationEva:
        alert.toStationEva ?? undefined,

      toStationName:
        alert.toStationName ?? undefined,

      alertType: alert.alertType,

      isEnabled: alert.isEnabled,

      isTriggered: alert.isTriggered,

      lastCheckedAt:
        alert.lastCheckedAt?.toISOString(),

      createdAt: alert.createdAt.toISOString(),

      updatedAt: alert.updatedAt.toISOString(),
    };
  },

  toDtoList(alerts: Alert[]): AlertDto[] {
    return alerts.map((alert) =>
      this.toDto(alert),
    );
  },
};