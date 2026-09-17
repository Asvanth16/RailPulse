import type { LiveTrain } from "../types/operations.types";

export type TrainOperationalStatus =
  "RUNNING" | "DELAYED" | "CANCELLED" | "PLATFORM_CHANGED";

export function getTrainOperationalStatus(
  train: LiveTrain,
): TrainOperationalStatus {
  // Cancellation always has the highest priority.
  if (train.cancelled) {
    return "CANCELLED";
  }

  // A platform difference means the current
  // platform differs from the planned platform.
  if (
    train.plannedPlatform !== undefined &&
    train.plannedPlatform !== null &&
    train.actualPlatform !== undefined &&
    train.actualPlatform !== null &&
    train.plannedPlatform !== train.actualPlatform
  ) {
    return "PLATFORM_CHANGED";
  }

  // Any positive arrival/departure delay
  // means the train is delayed.
  const arrivalDelay = train.arrivalDelayMinutes ?? 0;

  const departureDelay = train.departureDelayMinutes ?? 0;

  if (arrivalDelay > 0 || departureDelay > 0) {
    return "DELAYED";
  }

  return "RUNNING";
}
