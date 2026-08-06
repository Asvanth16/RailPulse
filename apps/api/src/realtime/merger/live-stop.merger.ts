import { LiveStopDto } from "../../dto/live";

export class LiveStopMerger {
  merge(
    planned: LiveStopDto,
    changed?: LiveStopDto,
  ): LiveStopDto {
    return {
      ...planned,

      plannedArrival:
        planned.plannedArrival,

      plannedDeparture:
        planned.plannedDeparture,

      plannedPlatform:
        planned.plannedPlatform,

      actualArrival:
        changed?.actualArrival ??
        planned.actualArrival,

      actualDeparture:
        changed?.actualDeparture ??
        planned.actualDeparture,

      actualPlatform:
        changed?.actualPlatform ??
        planned.actualPlatform,

      arrivalDelayMinutes:
        changed?.arrivalDelayMinutes ??
        planned.arrivalDelayMinutes,

      departureDelayMinutes:
        changed?.departureDelayMinutes ??
        planned.departureDelayMinutes,

      cancelled:
        changed?.cancelled ??
        planned.cancelled,

      messages:
        changed?.messages ??
        planned.messages,
    };
  }
}

export const liveStopMerger =
  new LiveStopMerger();