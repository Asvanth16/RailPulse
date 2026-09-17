import { Job } from "./job.interface";

import { operationsMonitoredStationRepository } from "../../repositories/operations-monitored-station.repository";

import { operationalHistoryRepository } from "../../repositories/operational-history.repository";

import { liveTrainMonitor } from "../monitor/live-train.monitor";

import { webSocketPublisher } from "../websocket/websocket.publisher";

import { liveTrainStateStore } from "../state/live-train-state.store";

export class LiveTrainUpdateJob implements Job {
  readonly name = "live-train-update";

  async execute(): Promise<void> {
    console.log("📡 Running Live Train Update Job");

    /*
     * ========================================
     * Operations monitored stations
     * ========================================
     *
     * Realtime Operations monitoring is
     * completely independent from passenger
     * alerts.
     */
    const monitoredStations =
      await operationsMonitoredStationRepository.findEnabled();

    console.log(
      `Found ${monitoredStations.length} monitored Operations stations.`,
    );

    const processedTrains = new Set<string>();

    for (const station of monitoredStations) {
      const eva = station.eva;

      try {
        /*
         * ========================================
         * Get previous station snapshot
         * ========================================
         *
         * IMPORTANT:
         * Read the previous snapshot BEFORE replacing
         * it with the newly fetched snapshot.
         *
         * This gives us a reliable station-scoped
         * previous state for realtime change detection.
         */
        const previousStationTrains =
          await liveTrainStateStore.getStationTrains(eva);

        const previousTrainsByNumber = new Map<
          string,
          (typeof previousStationTrains)[number]
        >();

        for (const previousTrain of previousStationTrains) {
          const trainNumber = String(previousTrain.train.trainNumber);

          if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
            continue;
          }

          previousTrainsByNumber.set(trainNumber, previousTrain);
        }

        /*
         * ========================================
         * Get UNIQUE live trains
         * ========================================
         */
        const timetable = await liveTrainMonitor.getUniqueStationChanges(eva);

        console.log(
          `📡 Received ${timetable.stops.length} unique live trains at EVA ${eva}.`,
        );

        const publishedTrains = new Set<string>();

        /*
         * ========================================
         * Process trains
         * ========================================
         */
        for (const train of timetable.stops) {
          const trainNumber = String(train.train.trainNumber);

          if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
            continue;
          }

          if (publishedTrains.has(trainNumber)) {
            continue;
          }

          publishedTrains.add(trainNumber);

          /*
           * ========================================
           * Previous state
           * ========================================
           *
           * IMPORTANT:
           * Use the station-scoped previous snapshot.
           *
           * Do not use the global train-number state
           * for change detection because the same train
           * number can exist at multiple stations.
           */
          const previousTrain = previousTrainsByNumber.get(trainNumber);

          /*
           * ========================================
           * Publish standard update
           * ========================================
           *
           * Every successfully processed live train
           * receives the current realtime snapshot.
           */
          webSocketPublisher.publishTrainUpdated(train);

          /*
           * ========================================
           * Compare previous state
           * ========================================
           */
          if (!previousTrain) {
            /*
             * Establish the first observed operational state for this
             * train at this station. This makes Train Details useful
             * even when the train was already delayed/cancelled before
             * the operator opened the page.
             *
             * These are snapshots, not fabricated railway changes.
             * The external DB state is only being recorded as observed.
             */
            const initialDelay = Math.max(
              train.arrivalDelayMinutes ?? 0,
              train.departureDelayMinutes ?? 0,
            );

            if (initialDelay > 0) {
              await operationalHistoryRepository.createInitialIfMissing({
                trainNumber,
                stationEva: eva,
                type: "DELAY_CHANGED",
                currentValue: String(initialDelay),
                message: `Train ${trainNumber} was first observed with a ${initialDelay}-minute delay at station ${eva}.`,
              });
            }

            const initialPlatform =
              train.actualPlatform ?? train.plannedPlatform ?? null;

            if (initialPlatform !== null) {
              await operationalHistoryRepository.createInitialIfMissing({
                trainNumber,
                stationEva: eva,
                type: "PLATFORM_CHANGED",
                currentValue: String(initialPlatform),
                message: `Train ${trainNumber} was first observed at platform ${initialPlatform} at station ${eva}.`,
              });
            }

            if (train.cancelled) {
              await operationalHistoryRepository.createInitialIfMissing({
                trainNumber,
                stationEva: eva,
                type: "CANCELLATION",
                currentValue: "true",
                message: `Train ${trainNumber} was first observed as cancelled at station ${eva}.`,
              });
            }

            if (train.actualArrival) {
              const occurredAt = new Date(train.actualArrival);

              if (!Number.isNaN(occurredAt.getTime())) {
                await operationalHistoryRepository.createInitialIfMissing({
                  trainNumber,
                  stationEva: eva,
                  type: "STATUS_CHANGED",
                  currentValue: train.actualArrival,
                  message: `Train ${trainNumber} had already arrived at station ${eva} when first observed.`,
                  occurredAt,
                });
              }
            }

            if (train.actualDeparture) {
              const occurredAt = new Date(train.actualDeparture);

              if (!Number.isNaN(occurredAt.getTime())) {
                await operationalHistoryRepository.createInitialIfMissing({
                  trainNumber,
                  stationEva: eva,
                  type: "STATUS_CHANGED",
                  currentValue: train.actualDeparture,
                  message: `Train ${trainNumber} had already departed from station ${eva} when first observed.`,
                  occurredAt,
                });
              }
            }
          }

          if (previousTrain) {
            /*
             * ----------------------------------------
             * Cancellation
             * ----------------------------------------
             */
            const previousCancelled = previousTrain.cancelled;

            const currentCancelled = train.cancelled;

            const cancellationChanged = previousCancelled !== currentCancelled;

            if (cancellationChanged) {
              if (currentCancelled) {
                await operationalHistoryRepository.create({
                  trainNumber,

                  stationEva: eva,

                  type: "CANCELLATION",

                  previousValue: String(previousCancelled),

                  currentValue: String(currentCancelled),

                  message: `Train ${trainNumber} was cancelled at station ${eva}.`,
                });

                webSocketPublisher.publishTrainCancelled(train);
              } else {
                await operationalHistoryRepository.create({
                  trainNumber,

                  stationEva: eva,

                  type: "STATUS_CHANGED",

                  previousValue: "true",

                  currentValue: "false",

                  message: `Train ${trainNumber} is no longer cancelled at station ${eva}.`,
                });

                webSocketPublisher.publishTrainCancelled(train);
              }
            }

            /*
             * ----------------------------------------
             * Arrival / Departure
             * ----------------------------------------
             *
             * Actual arrival/departure are external railway
             * state. We never modify them here; we only record
             * the observed transition in RailPulse history.
             */
            const arrivalChanged =
              previousTrain.actualArrival !== train.actualArrival;

            if (arrivalChanged && train.actualArrival) {
              await operationalHistoryRepository.create({
                trainNumber,

                stationEva: eva,

                type: "STATUS_CHANGED",

                previousValue: previousTrain.actualArrival ?? null,

                currentValue: train.actualArrival,

                message: `Train ${trainNumber} arrived at station ${eva}.`,

                occurredAt: new Date(train.actualArrival),
              });
            }

            const departureChanged =
              previousTrain.actualDeparture !== train.actualDeparture;

            if (departureChanged && train.actualDeparture) {
              await operationalHistoryRepository.create({
                trainNumber,

                stationEva: eva,

                type: "STATUS_CHANGED",

                previousValue: previousTrain.actualDeparture ?? null,

                currentValue: train.actualDeparture,

                message: `Train ${trainNumber} departed from station ${eva}.`,

                occurredAt: new Date(train.actualDeparture),
              });
            }

            /*
             * ----------------------------------------
             * Delay + Platform
             * ----------------------------------------
             */
            if (!currentCancelled) {
              /*
               * --------------------------------------
               * Delay
               * --------------------------------------
               */
              const previousArrivalDelay =
                previousTrain.arrivalDelayMinutes ?? 0;

              const currentArrivalDelay = train.arrivalDelayMinutes ?? 0;

              const previousDepartureDelay =
                previousTrain.departureDelayMinutes ?? 0;

              const currentDepartureDelay = train.departureDelayMinutes ?? 0;

              const arrivalDelayChanged =
                previousArrivalDelay !== currentArrivalDelay;

              const departureDelayChanged =
                previousDepartureDelay !== currentDepartureDelay;

              if (arrivalDelayChanged || departureDelayChanged) {
                const previousDelay = Math.max(
                  previousArrivalDelay,
                  previousDepartureDelay,
                );

                const currentDelay = Math.max(
                  currentArrivalDelay,
                  currentDepartureDelay,
                );

                await operationalHistoryRepository.create({
                  trainNumber,

                  stationEva: eva,

                  type: "DELAY_CHANGED",

                  previousValue: String(previousDelay),

                  currentValue: String(currentDelay),

                  message: `Train ${trainNumber} delay changed from ${previousDelay} to ${currentDelay} minutes at station ${eva}.`,
                });

                webSocketPublisher.publishTrainDelayUpdated(train);
              }

              /*
               * --------------------------------------
               * Platform
               * --------------------------------------
               */
              const previousPlannedPlatform =
                previousTrain.plannedPlatform ?? null;

              const currentPlannedPlatform = train.plannedPlatform ?? null;

              const previousActualPlatform =
                previousTrain.actualPlatform ?? null;

              const currentActualPlatform = train.actualPlatform ?? null;

              const plannedPlatformChanged =
                previousPlannedPlatform !== currentPlannedPlatform;

              const actualPlatformChanged =
                previousActualPlatform !== currentActualPlatform;

              if (plannedPlatformChanged || actualPlatformChanged) {
                const previousPlatform =
                  previousActualPlatform ?? previousPlannedPlatform;

                const currentPlatform =
                  currentActualPlatform ?? currentPlannedPlatform;

                if (previousPlatform !== null || currentPlatform !== null) {
                  await operationalHistoryRepository.create({
                    trainNumber,

                    stationEva: eva,

                    type: "PLATFORM_CHANGED",

                    previousValue:
                      previousPlatform !== null
                        ? String(previousPlatform)
                        : null,

                    currentValue:
                      currentPlatform !== null ? String(currentPlatform) : null,

                    message: `Train ${trainNumber} platform changed from ${previousPlatform ?? "N/A"} to ${currentPlatform ?? "N/A"} at station ${eva}.`,
                  });

                  webSocketPublisher.publishTrainPlatformChanged(train);
                }
              }
            }
          }

          /*
           * ========================================
           * Store current individual state
           * ========================================
           *
           * Keep the existing individual train state
           * because other Operations functionality
           * currently reads it by train number.
           */
          await liveTrainStateStore.set(train);

          processedTrains.add(trainNumber);
        }

        /*
         * ========================================
         * Store current station snapshot
         * ========================================
         *
         * This happens AFTER change detection.
         */
        await liveTrainStateStore.setStationTrains(eva, timetable.stops);

        console.log(
          `📡 Published ${publishedTrains.size} unique trains at EVA ${eva}.`,
        );
      } catch (error) {
        console.error(`❌ Live train update failed for station ${eva}:`, error);
      }
    }

    console.log(
      `📡 Live Train Update Job processed ${processedTrains.size} unique trains.`,
    );
  }
}

export const liveTrainUpdateJob = new LiveTrainUpdateJob();
