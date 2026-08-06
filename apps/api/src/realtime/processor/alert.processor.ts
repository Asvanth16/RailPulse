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
      await notificationService.send({
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
}

export const alertProcessor = new AlertProcessor();
