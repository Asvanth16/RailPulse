import { Alert } from "@prisma/client";

import { LiveStopDto } from "../../dto/live";

export class AlertEngine {
  shouldTriggerDelay(
    alert: Alert,
    train: LiveStopDto,
  ): boolean {
    if (alert.isTriggered) {
      return false;
    }

    if (train.cancelled) {
      return false;
    }

    const delay =
      train.departureDelayMinutes ??
      train.arrivalDelayMinutes ??
      0;

    return delay >= 5;
  }
}

export const alertEngine = new AlertEngine();