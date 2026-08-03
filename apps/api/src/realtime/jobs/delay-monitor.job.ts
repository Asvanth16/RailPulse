import { Job } from "./job.interface";

import { alertRepository } from "../../repositories/alert.repository";
import { liveTrainMonitor } from "../monitor/live-train.monitor";

export class DelayMonitorJob implements Job {
  readonly name = "delay-monitor";

  async execute(): Promise<void> {
    console.log("🚆 Running Delay Monitor Job");

    const alerts = await alertRepository.findEnabledByType("DELAY");

    console.log(`Found ${alerts.length} active delay alerts.`);

    for (const alert of alerts) {
      if (!alert.trainNumber || !alert.monitorStationEva) {
        console.warn(
          `Skipping alert ${alert.id}: missing train number or monitor station.`,
        );
        continue;
      }

      const train = await liveTrainMonitor.findTrainAtStation(
        alert.monitorStationEva,
        alert.trainNumber,
      );

      if (!train) {
        console.log(
          `🚫 Train ${alert.trainNumber} not found at ${alert.monitorStationName} (${alert.monitorStationEva}).`,
        );
        continue;
      }

      console.log(`✅ Train ${alert.trainNumber} found:`, train);

      // Next step:
      // Pass 'train' and 'alert' to the Alert Engine.
    }
  }
}
