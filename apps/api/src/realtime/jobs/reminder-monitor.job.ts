import { Job } from "./job.interface";

import { alertRepository } from "../../repositories/alert.repository";
import { liveTrainMonitor } from "../monitor/live-train.monitor";
import { alertProcessor } from "../processor/alert.processor";

export class ReminderMonitorJob implements Job {
  readonly name = "reminder-monitor";

  async execute(): Promise<void> {
    console.log("⏰ Running Reminder Monitor Job");

    const departureAlerts =
      await alertRepository.findEnabledByType(
        "DEPARTURE_REMINDER",
      );

    const arrivalAlerts =
      await alertRepository.findEnabledByType(
        "ARRIVAL_REMINDER",
      );

    const alerts = [
      ...departureAlerts,
      ...arrivalAlerts,
    ];

    console.log(
      `Found ${alerts.length} active reminder alerts.`,
    );

    for (const alert of alerts) {
      if (!alert.trainNumber || !alert.monitorStationEva) {
        continue;
      }

      await alertRepository.updateLastChecked(alert.id);

      const train =
        await liveTrainMonitor.findTrainAtStation(
          alert.monitorStationEva,
          alert.trainNumber,
        );

      if (!train) {
        continue;
      }

      await alertProcessor.processReminder(
        alert,
        train,
      );
    }
  }
}

export const reminderMonitorJob =
  new ReminderMonitorJob();