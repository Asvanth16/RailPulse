import { AlertWithUser } from "../types/alert.types";

import { LiveStopDto } from "../../dto/live";
import { alertEngine } from "../engine/alert.engine";
import { notificationService } from "../notifications/notification.service";
import { alertRepository } from "../../repositories/alert.repository";

export class AlertProcessor {
  async processDelay(alert: AlertWithUser, train: LiveStopDto): Promise<void> {
    if (alertEngine.hasPassedStation(train)) {
      await alertRepository.completeAlert(alert.id);

      console.log(
        `🏁 Alert completed for ${alert.trainNumber}. Train has passed ${alert.monitorStationName}.`,
      );

      return;
    }

    const isDelayed = alertEngine.isDelayed(train);

    const shouldTrigger = alertEngine.shouldTriggerDelay(alert, train);

    if (shouldTrigger) {
      await notificationService.sendDelay({
        userId: alert.userId,
        email: alert.user.email,
        firstName: alert.user.firstName,
        title: "🚆 Train Delay Alert",
        trainNumber: alert.trainNumber!,
        stationName: alert.monitorStationName!,
        delayMinutes:
          train.departureDelayMinutes ?? train.arrivalDelayMinutes ?? 0,
      });

      await alertRepository.markTriggered(alert.id, new Date());

      console.log(`✅ Alert marked as triggered for ${alert.trainNumber}.`);

      return;
    }

    if (!isDelayed && alert.isTriggered) {
      await alertRepository.resetTriggered(alert.id);

      console.log(`🔄 Alert reset for ${alert.trainNumber}.`);
    }
  }

  async processPlatform(
    alert: AlertWithUser,
    train: LiveStopDto,
  ): Promise<void> {
    if (alertEngine.hasPassedStation(train)) {
      await alertRepository.completeAlert(alert.id);

      console.log(
        `🏁 Alert completed for ${alert.trainNumber}. Train has passed ${alert.monitorStationName}.`,
      );

      return;
    }

    const isPlatformChanged = alertEngine.isPlatformChanged(train);

    const shouldTrigger = alertEngine.shouldTriggerPlatform(alert, train);

    if (shouldTrigger) {
      await notificationService.sendPlatform({
        userId: alert.userId,
        email: alert.user.email,
        firstName: alert.user.firstName,
        title: "🚉 Platform Change Alert",
        trainNumber: alert.trainNumber!,
        stationName: alert.monitorStationName!,
        plannedPlatform: train.plannedPlatform!,
        actualPlatform: train.actualPlatform!,
      });

      await alertRepository.markTriggered(alert.id, new Date());

      console.log(`✅ Platform alert triggered for ${alert.trainNumber}.`);

      return;
    }

    if (!isPlatformChanged && alert.isTriggered) {
      await alertRepository.resetTriggered(alert.id);

      console.log(`🔄 Platform alert reset for ${alert.trainNumber}.`);
    }
  }

  async processCancellation(
    alert: AlertWithUser,
    train: LiveStopDto,
  ): Promise<void> {
    if (alertEngine.hasPassedStation(train)) {
      await alertRepository.completeAlert(alert.id);

      console.log(
        `🏁 Alert completed for ${alert.trainNumber}. Train has passed ${alert.monitorStationName}.`,
      );

      return;
    }

    const isCancelled = alertEngine.isCancelled(train);

    const shouldTrigger = alertEngine.shouldTriggerCancellation(alert, train);

    if (shouldTrigger) {
      await notificationService.sendCancellation({
        userId: alert.userId,
        email: alert.user.email,
        firstName: alert.user.firstName,
        title: "❌ Train Cancellation Alert",
        trainNumber: alert.trainNumber!,
        stationName: alert.monitorStationName!,
      });

      await alertRepository.markTriggered(alert.id, new Date());

      console.log(`✅ Cancellation alert triggered for ${alert.trainNumber}.`);

      return;
    }

    if (!isCancelled && alert.isTriggered) {
      await alertRepository.resetTriggered(alert.id);

      console.log(`🔄 Cancellation alert reset for ${alert.trainNumber}.`);
    }
  }

  async processReminder(
    alert: AlertWithUser,
    train: LiveStopDto,
  ): Promise<void> {
    if (alert.isTriggered) {
      return;
    }

    let shouldTrigger = false;

    switch (alert.alertType) {
      case "DEPARTURE_REMINDER":
        shouldTrigger = alertEngine.shouldTriggerDepartureReminder(
          alert,
          train,
        );
        break;

      case "ARRIVAL_REMINDER":
        shouldTrigger = alertEngine.shouldTriggerArrivalReminder(alert, train);
        break;

      default:
        return;
    }

    if (!shouldTrigger) {
      return;
    }

    if (alert.alertType === "DEPARTURE_REMINDER") {
      await notificationService.sendDepartureReminder({
        userId: alert.userId,
        email: alert.user.email,
        firstName: alert.user.firstName,
        title: "🚆 Departure Reminder",
        trainNumber: alert.trainNumber!,
        stationName: alert.monitorStationName!,
        reminderMinutes: alert.reminderMinutes ?? 15,
        departureTime: train.actualDeparture ?? train.plannedDeparture,
      });
    }

    if (alert.alertType === "ARRIVAL_REMINDER") {
      await notificationService.sendArrivalReminder({
        userId: alert.userId,
        email: alert.user.email,
        firstName: alert.user.firstName,
        title: "🚆 Arrival Reminder",
        trainNumber: alert.trainNumber!,
        stationName: alert.monitorStationName!,
        reminderMinutes: alert.reminderMinutes ?? 15,
        arrivalTime: train.actualArrival ?? train.plannedArrival,
      });
    }

    await alertRepository.markTriggered(alert.id, new Date());

    console.log(`✅ ${alert.alertType} triggered for ${alert.trainNumber}.`);
  }
}

export const alertProcessor = new AlertProcessor();
