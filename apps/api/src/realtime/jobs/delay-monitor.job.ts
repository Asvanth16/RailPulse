import { Job } from "./job.interface";
import { alertRepository } from "../../repositories/alert.repository";
import { liveTrainMonitor } from "../monitor/live-train.monitor";
import { alertProcessor } from "../processor/alert.processor";

export class DelayMonitorJob implements Job {
  readonly name = "delay-monitor";

  async execute(): Promise<void> {
    console.log("🚆 Running Delay Monitor Job");

    const alerts = await alertRepository.findEnabledByType("DELAY");

    console.log(`Found ${alerts.length} active delay alerts.`);

    for (const alert of alerts) {
      if (!alert.trainNumber || !alert.monitorStationEva) {
        continue;
      }

      await alertRepository.updateLastChecked(alert.id);

      const train = await liveTrainMonitor.findTrainAtStation(
        alert.monitorStationEva,
        alert.trainNumber,
      );

      if (!train) {
        continue;
      }

      await alertProcessor.processDelay(alert, train);
    }
  }
}
