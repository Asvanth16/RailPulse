import { Job } from "./job.interface";

import { alertRepository } from "../../repositories/alert.repository";
import { liveTrainMonitor } from "../monitor/live-train.monitor";
import { alertProcessor } from "../processor/alert.processor";

export class PlatformMonitorJob implements Job {
  readonly name = "platform-monitor";

  async execute(): Promise<void> {
    console.log("🚉 Running Platform Monitor Job");

    const alerts =
      await alertRepository.findEnabledByType("PLATFORM_CHANGE");

    console.log(
      `Found ${alerts.length} active platform alerts.`,
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

      await alertProcessor.processPlatform(
        alert,
        train,
      );
    }
  }
}