import { Job } from "./job.interface";

import { alertRepository } from "../../repositories/alert.repository";
import { liveTrainMonitor } from "../monitor/live-train.monitor";
import { webSocketPublisher } from "../websocket/websocket.publisher";

export class LiveTrainUpdateJob implements Job {
  readonly name = "live-train-update";

  async execute(): Promise<void> {
    console.log("📡 Running Live Train Update Job");

    const stations = await alertRepository.findEnabledMonitorStations();

    console.log(`Found ${stations.length} monitored stations.`);

    for (const eva of stations) {
      try {
        const timetable = await liveTrainMonitor.getStationChanges(eva);

        console.log(
          `📡 Found ${timetable.stops.length} live trains at EVA ${eva}.`,
        );

        const publishedTrains = new Set<string>();

        for (const train of timetable.stops) {
          const trainNumber = train.train.trainNumber;

          if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
            continue;
          }

          if (publishedTrains.has(trainNumber)) {
            continue;
          }

          publishedTrains.add(trainNumber);

          webSocketPublisher.publishTrainUpdated(train);
        }

        console.log(
          `📡 Published ${publishedTrains.size} unique trains at EVA ${eva}.`,
        );
      } catch (error) {
        console.error(`❌ Live train update failed for station ${eva}:`, error);
      }
    }
  }
}

export const liveTrainUpdateJob = new LiveTrainUpdateJob();
