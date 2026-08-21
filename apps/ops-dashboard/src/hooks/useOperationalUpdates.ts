import { useRef, useState } from "react";

import type {
  LiveTrain,
  OperationalUpdate,
} from "../types/operations.types";

import { detectOperationalUpdates } from "../utils/operationalUpdates";

const MAX_RECENT_UPDATES = 20;

export function useOperationalUpdates() {
  const previousTrainsRef =
    useRef<LiveTrain[] | null>(null);

  const [updates, setUpdates] =
    useState<OperationalUpdate[]>([]);

  function processSnapshot(
    currentTrains: LiveTrain[],
  ) {
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
  }

  function clearUpdates() {
    setUpdates([]);
  }

  return {
    updates,
    processSnapshot,
    clearUpdates,
  };
}