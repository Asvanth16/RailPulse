import { LiveStopDto } from "../../dto/live";

export class LiveStopMerger {
  merge(planned: LiveStopDto, changed?: LiveStopDto): LiveStopDto {
    return {
      ...planned,

      // =========================
      // Planned values
      // =========================

      plannedArrival: planned.plannedArrival,

      plannedDeparture: planned.plannedDeparture,

      plannedPlatform: planned.plannedPlatform,

      // =========================
      // Live values
      // =========================

      actualArrival: changed?.actualArrival ?? planned.actualArrival,

      actualDeparture: changed?.actualDeparture ?? planned.actualDeparture,

      actualPlatform: changed?.actualPlatform ?? planned.actualPlatform,

      arrivalDelayMinutes:
        changed?.arrivalDelayMinutes ?? planned.arrivalDelayMinutes,

      departureDelayMinutes:
        changed?.departureDelayMinutes ?? planned.departureDelayMinutes,

      cancelled: changed?.cancelled ?? planned.cancelled,

      messages: changed?.messages ?? planned.messages,

      // =========================
      // Route information
      // =========================

      /*
       * Prefer the changed/live path when available,
       * because Deutsche Bahn's cpth represents the
       * currently changed route.
       */
      previousStations: changed?.previousStations ?? planned.previousStations,

      nextStations: changed?.nextStations ?? planned.nextStations,

      origin: changed?.origin ?? planned.origin,

      destination: changed?.destination ?? planned.destination,
    };
  }
}

export const liveStopMerger = new LiveStopMerger();
