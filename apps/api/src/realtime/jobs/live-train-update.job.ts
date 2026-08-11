import { Job } from "./job.interface";

import { alertRepository } from "../../repositories/alert.repository";
import { liveTrainMonitor } from "../monitor/live-train.monitor";
import { webSocketPublisher } from "../websocket/websocket.publisher";
import { liveTrainStateStore } from "../state/live-train-state.store";

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

        await liveTrainStateStore.setStationTrains(eva, timetable.stops);

        const publishedTrains = new Set<string>();

        for (const train of timetable.stops) {
          const trainNumber = String(train.train.trainNumber);

          if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
            continue;
          }

          if (publishedTrains.has(trainNumber)) {
            continue;
          }

          publishedTrains.add(trainNumber);

          const previousTrain = await liveTrainStateStore.get(trainNumber);

          // ----------------------------------------
          // Always publish general train update
          // ----------------------------------------

          webSocketPublisher.publishTrainUpdated(train);

          // ----------------------------------------
          // Delay change detection
          // ----------------------------------------

          if (previousTrain) {
            const previousArrivalDelay = previousTrain.arrivalDelayMinutes ?? 0;

            const currentArrivalDelay = train.arrivalDelayMinutes ?? 0;

            const previousDepartureDelay =
              previousTrain.departureDelayMinutes ?? 0;

            const currentDepartureDelay = train.departureDelayMinutes ?? 0;

            if (
              previousArrivalDelay !== currentArrivalDelay ||
              previousDepartureDelay !== currentDepartureDelay
            ) {
              webSocketPublisher.publishTrainDelayUpdated(train);
            }

            // ----------------------------------------
            // Platform change detection
            // ----------------------------------------

            const previousPlannedPlatform =
              previousTrain.plannedPlatform ?? null;

            const currentPlannedPlatform = train.plannedPlatform ?? null;

            const previousActualPlatform = previousTrain.actualPlatform ?? null;

            const currentActualPlatform = train.actualPlatform ?? null;

            if (
              previousPlannedPlatform !== currentPlannedPlatform ||
              previousActualPlatform !== currentActualPlatform
            ) {
              webSocketPublisher.publishTrainPlatformChanged(train);
            }

            // ----------------------------------------
            // Cancellation change detection
            // ----------------------------------------

            if (previousTrain.cancelled !== train.cancelled) {
              webSocketPublisher.publishTrainCancelled(train);
            }
          }

          // ----------------------------------------
          // Store CURRENT state AFTER comparison
          // ----------------------------------------

          await liveTrainStateStore.set(train);
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
