import { useCallback, useRef, useState } from "react";

import type {
  LiveTrain,
  OperationalUpdate,
} from "../types/operations.types";

import { detectOperationalUpdates } from "../utils/operationalUpdates";

import type { OperationsWebSocketEvent } from "../websocket/websocket.types";

const MAX_RECENT_UPDATES = 20;

export function useOperationalUpdates() {
  const previousTrainsRef =
    useRef<LiveTrain[] | null>(null);

  const [updates, setUpdates] =
    useState<OperationalUpdate[]>([]);

  /*
   * The Operations WebSocket sends category information with the standard
   * train update, then publishes specialized operational-change events.
   * Keep that metadata so a following delay/platform/cancellation event can
   * be rendered with the same train identity.
   */
  const trainCategoriesRef = useRef<Map<string, string>>(new Map());

  const addUpdate = useCallback((update: OperationalUpdate) => {
    setUpdates((previousUpdates) => {
      if (previousUpdates.some((existing) => existing.id === update.id)) {
        return previousUpdates;
      }

      return [update, ...previousUpdates].slice(0, MAX_RECENT_UPDATES);
    });
  }, []);

  const processSnapshot = useCallback((
    currentTrains: LiveTrain[],
  ) => {
    const previousTrains =
      previousTrainsRef.current;

    // First snapshot:
    // There is nothing to compare against.
    if (!previousTrains) {
      previousTrainsRef.current =
        currentTrains;

      return;
    }

    const detectedUpdates =
      detectOperationalUpdates(
        previousTrains,
        currentTrains,
      );

    if (detectedUpdates.length > 0) {
      setUpdates((previousUpdates) => {
        const combined = [
          ...detectedUpdates,
          ...previousUpdates,
        ];

        return combined.slice(
          0,
          MAX_RECENT_UPDATES,
        );
      });
    }

    // Current snapshot becomes
    // the next comparison snapshot.
    previousTrainsRef.current =
      currentTrains;
  }, []);

  const processRealtimeEvent = useCallback(
    (event: OperationsWebSocketEvent) => {
      const trainKey = `${event.data.trainNumber}-${event.data.stationEva}`;

      if (event.type === "train:updated") {
        trainCategoriesRef.current.set(trainKey, event.data.category);
        return;
      }

      const category = trainCategoriesRef.current.get(trainKey) ?? "Train";

      if (event.type === "train:delay_updated") {
        const delay = Math.max(
          event.data.arrivalDelayMinutes,
          event.data.departureDelayMinutes,
        );

        addUpdate({
          id: `delay-${trainKey}-${event.data.updatedAt}`,
          type: "DELAY_CHANGED",
          trainNumber: event.data.trainNumber,
          category,
          stationEva: event.data.stationEva,
          currentValue: delay,
          message: `${category} ${event.data.trainNumber} delay changed to ${delay} minutes.`,
          detectedAt: event.data.updatedAt,
        });

        return;
      }

      if (event.type === "train:platform_changed") {
        const platform =
          event.data.actualPlatform ?? event.data.plannedPlatform ?? "N/A";

        addUpdate({
          id: `platform-${trainKey}-${event.data.updatedAt}`,
          type: "PLATFORM_CHANGED",
          trainNumber: event.data.trainNumber,
          category,
          stationEva: event.data.stationEva,
          currentValue: platform,
          message: `${category} ${event.data.trainNumber} platform changed to ${platform}.`,
          detectedAt: event.data.updatedAt,
        });

        return;
      }

      if (event.data.cancelled) {
        addUpdate({
          id: `cancelled-${trainKey}-${event.data.updatedAt}`,
          type: "CANCELLED",
          trainNumber: event.data.trainNumber,
          category,
          stationEva: event.data.stationEva,
          previousValue: false,
          currentValue: true,
          message: `${category} ${event.data.trainNumber} has been cancelled.`,
          detectedAt: event.data.updatedAt,
        });
      }
    },
    [addUpdate],
  );

  const clearUpdates = useCallback(() => {
    setUpdates([]);
  }, []);

  return {
    updates,
    processSnapshot,
    processRealtimeEvent,
    clearUpdates,
  };
}
