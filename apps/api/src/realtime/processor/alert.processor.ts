import { AlertWithUser } from "../types/alert.types";

import { LiveStopDto } from "../../dto/live";
import { alertEngine } from "../engine/alert.engine";
import { notificationService } from "../notifications/notification.service";
import { alertRepository } from "../../repositories/alert.repository";
import { webSocketAlertPublisher } from "../websocket/websocket.alert-publisher";

export class AlertProcessor {
  private publishAlert(
    alert: AlertWithUser,
    train: LiveStopDto,
    title: string,
    message: string,
  ): void {
    webSocketAlertPublisher.publishAlertTriggered(alert.userId, {
      alertId: alert.id,
      alertType: alert.alertType,
      trainNumber: alert.trainNumber!,
      stationEva: alert.monitorStationEva ?? train.stationEva,
      title,
      message,
      triggeredAt: new Date().toISOString(),
    });
  }

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

      this.publishAlert(
        alert,
        train,
        "🚆 Train Delay Alert",
        `Your train ${alert.trainNumber} is delayed by ${
          train.departureDelayMinutes ?? train.arrivalDelayMinutes ?? 0
        } minute(s) at ${alert.monitorStationName}.`,
      );

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

      this.publishAlert(
        alert,
        train,
        "🚉 Platform Change Alert",
        `Your train ${alert.trainNumber} has changed platform from ${
          train.plannedPlatform
        } to ${train.actualPlatform} at ${alert.monitorStationName}.`,
      );

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

      this.publishAlert(
        alert,
        train,
        "❌ Train Cancellation Alert",
        `Your train ${alert.trainNumber} has been cancelled at ${alert.monitorStationName}.`,
      );

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

      this.publishAlert(
        alert,
        train,
        "🚆 Departure Reminder",
        `Your train ${alert.trainNumber} departs from ${alert.monitorStationName} in approximately ${
          alert.reminderMinutes ?? 15
        } minute(s).`,
      );
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

      this.publishAlert(
        alert,
        train,
        "🚆 Arrival Reminder",
        `Your train ${alert.trainNumber} is expected to arrive at ${alert.monitorStationName} in approximately ${
          alert.reminderMinutes ?? 15
        } minute(s).`,
      );
    }

    await alertRepository.markTriggered(alert.id, new Date());

    console.log(`✅ ${alert.alertType} triggered for ${alert.trainNumber}.`);
  }
}

export const alertProcessor = new AlertProcessor();
