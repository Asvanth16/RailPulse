import { Alert } from "@prisma/client";

import { LiveStopDto } from "../../dto/live";
import {
  ALERT_DELAY_THRESHOLD_MINUTES,
  ALERT_COMPLETION_GRACE_PERIOD_MINUTES,
  MILLISECONDS_PER_MINUTE,
} from "../../constants/realtime.constants";

export class AlertEngine {
  isDelayed(train: LiveStopDto): boolean {
    if (train.cancelled) {
      return false;
    }

    const delay = train.departureDelayMinutes ?? train.arrivalDelayMinutes ?? 0;

    return delay >= ALERT_DELAY_THRESHOLD_MINUTES;
  }

  shouldTriggerDelay(alert: Alert, train: LiveStopDto): boolean {
    return this.isDelayed(train) && !alert.isTriggered;
  }

  isPlatformChanged(train: LiveStopDto): boolean {
    if (!train.plannedPlatform || !train.actualPlatform) {
      return false;
    }

    return train.plannedPlatform !== train.actualPlatform;
  }

  shouldTriggerPlatform(alert: Alert, train: LiveStopDto): boolean {
    return this.isPlatformChanged(train) && !alert.isTriggered;
  }

  hasPassedStation(train: LiveStopDto): boolean {
    const departureTime = train.actualDeparture ?? train.plannedDeparture;

    if (!departureTime) {
      return false;
    }

    const departedAt = new Date(departureTime).getTime();
    const now = Date.now();

    const gracePeriod =
      ALERT_COMPLETION_GRACE_PERIOD_MINUTES * MILLISECONDS_PER_MINUTE;

    return now >= departedAt + gracePeriod;
  }

  isCancelled(train: LiveStopDto): boolean {
    return train.cancelled;
  }

  shouldTriggerCancellation(alert: Alert, train: LiveStopDto): boolean {
    return this.isCancelled(train) && !alert.isTriggered;
  }

  isDepartureReminderDue(alert: Alert, train: LiveStopDto): boolean {
    const departureTime = train.actualDeparture ?? train.plannedDeparture;

    if (!departureTime) {
      return false;
    }

    const departureTimestamp = new Date(departureTime).getTime();

    const now = Date.now();

    const remainingMinutes =
      (departureTimestamp - now) / MILLISECONDS_PER_MINUTE;

    const reminderMinutes = alert.reminderMinutes ?? 15;

    return remainingMinutes > 0 && remainingMinutes <= reminderMinutes;
  }

  shouldTriggerDepartureReminder(alert: Alert, train: LiveStopDto): boolean {
    return this.isDepartureReminderDue(alert, train) && !alert.isTriggered;
  }

  isArrivalReminderDue(alert: Alert, train: LiveStopDto): boolean {
    const arrivalTime = train.actualArrival ?? train.plannedArrival;

    if (!arrivalTime) {
      return false;
    }

    const arrivalTimestamp = new Date(arrivalTime).getTime();

    const now = Date.now();

    const remainingMinutes = (arrivalTimestamp - now) / MILLISECONDS_PER_MINUTE;

    const reminderMinutes = alert.reminderMinutes ?? 15;

    return remainingMinutes > 0 && remainingMinutes <= reminderMinutes;
  }

  shouldTriggerArrivalReminder(alert: Alert, train: LiveStopDto): boolean {
    return this.isArrivalReminderDue(alert, train) && !alert.isTriggered;
  }
}

export const alertEngine = new AlertEngine();
