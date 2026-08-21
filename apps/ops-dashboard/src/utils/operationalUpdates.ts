import type { LiveTrain, OperationalUpdate } from "../types/operations.types";

function getDelay(train: LiveTrain): number {
  return Math.max(
    train.arrivalDelayMinutes ?? 0,
    train.departureDelayMinutes ?? 0,
  );
}

function hasPlatformChanged(train: LiveTrain): boolean {
  return (
    train.plannedPlatform !== undefined &&
    train.plannedPlatform !== null &&
    train.actualPlatform !== undefined &&
    train.actualPlatform !== null &&
    train.plannedPlatform !== train.actualPlatform
  );
}

function getPlatform(train: LiveTrain): number | null {
  if (train.actualPlatform !== undefined && train.actualPlatform !== null) {
    return train.actualPlatform;
  }

  if (train.plannedPlatform !== undefined && train.plannedPlatform !== null) {
    return train.plannedPlatform;
  }

  return null;
}

export function detectOperationalUpdates(
  previousTrains: LiveTrain[],
  currentTrains: LiveTrain[],
): OperationalUpdate[] {
  const updates: OperationalUpdate[] = [];

  const previousMap = new Map<string, LiveTrain>();

  for (const train of previousTrains) {
    const key = `${train.train.trainNumber}-${train.stationEva}`;

    previousMap.set(key, train);
  }

  for (const currentTrain of currentTrains) {
    const trainNumber = String(currentTrain.train.trainNumber);

    const key = `${trainNumber}-${currentTrain.stationEva}`;

    const previousTrain = previousMap.get(key);

    // No previous snapshot means
    // we cannot determine whether
    // something changed.
    if (!previousTrain) {
      continue;
    }

    const detectedAt = new Date().toISOString();

    // =========================
    // Cancellation
    // =========================

    if (!previousTrain.cancelled && currentTrain.cancelled) {
      updates.push({
        id: crypto.randomUUID(),

        type: "CANCELLED",

        trainNumber,

        category: currentTrain.train.category,

        stationEva: currentTrain.stationEva,

        previousValue: false,

        currentValue: true,

        message: `${currentTrain.train.category} ${trainNumber} has been cancelled.`,

        detectedAt,
      });
    }

    // =========================
    // Delay change
    // =========================

    const previousDelay = getDelay(previousTrain);

    const currentDelay = getDelay(currentTrain);

    if (previousDelay !== currentDelay) {
      updates.push({
        id: crypto.randomUUID(),

        type: "DELAY_CHANGED",

        trainNumber,

        category: currentTrain.train.category,

        stationEva: currentTrain.stationEva,

        previousValue: previousDelay,

        currentValue: currentDelay,

        message:
          currentDelay > previousDelay
            ? `${currentTrain.train.category} ${trainNumber} delay increased from ${previousDelay} to ${currentDelay} minutes.`
            : `${currentTrain.train.category} ${trainNumber} delay changed from ${previousDelay} to ${currentDelay} minutes.`,

        detectedAt,
      });
    }

    // =========================
    // Platform change
    // =========================

    const previousPlatform = getPlatform(previousTrain);

    const currentPlatform = getPlatform(currentTrain);

    if (
      previousPlatform !== null &&
      currentPlatform !== null &&
      previousPlatform !== currentPlatform &&
      hasPlatformChanged(currentTrain)
    ) {
      updates.push({
        id: crypto.randomUUID(),

        type: "PLATFORM_CHANGED",

        trainNumber,

        category: currentTrain.train.category,

        stationEva: currentTrain.stationEva,

        previousValue: previousPlatform,

        currentValue: currentPlatform,

        message: `${currentTrain.train.category} ${trainNumber} platform changed from ${previousPlatform} to ${currentPlatform}.`,

        detectedAt,
      });
    }
  }

  return updates;
}
