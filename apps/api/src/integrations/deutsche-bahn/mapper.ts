import {
  Event,
  Message,
  MultipleStationData,
  StationData,
  Timetable,
  TimetableStop,
  TripLabel,
} from "./types";

import {
  LiveMessageDto,
  LiveStationDto,
  LiveStopDto,
  LiveTimetableDto,
  LiveTrainDto,
} from "../../dto/live";

/**
 * Converts Deutsche Bahn XML models into
 * RailPulse Live DTOs.
 */
export class DeutscheBahnMapper {
  private safeArray<T>(value?: T | T[]): T[] {
    if (!value) {
      return [];
    }

    return Array.isArray(value) ? value : [value];
  }

  private parseTimestamp(value?: string | number): string | undefined {
    if (value === undefined || value === null) {
      return undefined;
    }

    const timestamp = String(value);

    if (timestamp.length !== 10) {
      return undefined;
    }

    const year = Number(timestamp.slice(0, 2)) + 2000;

    const month = Number(timestamp.slice(2, 4)) - 1;

    const day = Number(timestamp.slice(4, 6));

    const hour = Number(timestamp.slice(6, 8));

    const minute = Number(timestamp.slice(8, 10));

    return new Date(Date.UTC(year, month, day, hour, minute)).toISOString();
  }

  private calculateDelay(
    planned?: string,
    actual?: string,
  ): number | undefined {
    if (!planned || !actual) {
      return undefined;
    }

    const plannedTime = new Date(planned).getTime();

    const actualTime = new Date(actual).getTime();

    // Never return negative delays.
    return Math.max(0, Math.round((actualTime - plannedTime) / 60000));
  }

  private isCancelled(event?: Event): boolean {
    return !!event?.clt;
  }

  /**
   * Parses one DB path field.
   *
   * DB path values are pipe-delimited:
   *
   * Hamburg-Harburg|Hamburg Hbf|Berlin Gesundbrunnen
   */
  private parsePath(event?: Event): string[] {
    /*
     * Prefer changed path because it represents
     * the current/re-routed operational path.
     *
     * Fall back to the planned path.
     */
    const raw = event?.cpth ?? event?.ppth;

    if (!raw) {
      return [];
    }

    return raw
      .split("|")
      .map((station) => station.trim())
      .filter((station) => station.length > 0);
  }

  /**
   * Extracts the route information for a stop.
   *
   * Arrival path describes the stations before
   * the current stop.
   *
   * Departure path describes the stations after
   * the current stop.
   */
  private parseRoute(
    arrivalEvent?: Event,
    departureEvent?: Event,
  ): {
    previousStations?: string[];
    nextStations?: string[];
    origin?: string;
    destination?: string;
  } {
    const previousStations = this.parsePath(arrivalEvent);

    const nextStations = this.parsePath(departureEvent);

    /*
     * Origin:
     * first station available in the arrival path.
     */
    const origin =
      previousStations.length > 0 ? previousStations[0] : undefined;

    /*
     * Destination:
     *
     * DB provides the final destination directly on an event:
     * - cde is the current (changed) destination;
     * - pde is the planned destination.
     *
     * Prefer the departure event because it describes the journey
     * leaving this station. An arrival-only stop (for example, a
     * terminating train) legitimately falls back to its arrival
     * event. The route path is only a fallback because ppth/cpth is
     * optional and can be absent from a live change response.
     */
    const destination =
      departureEvent?.cde ??
      departureEvent?.pde ??
      arrivalEvent?.cde ??
      arrivalEvent?.pde ??
      (nextStations.length > 0
        ? nextStations[nextStations.length - 1]
        : undefined);

    return {
      previousStations:
        previousStations.length > 0 ? previousStations : undefined,

      nextStations: nextStations.length > 0 ? nextStations : undefined,

      origin,

      destination,
    };
  }

  mapTrain(label?: TripLabel): LiveTrainDto {
    return {
      trainNumber: label?.n ?? "Unknown",

      category: label?.c ?? "",

      operator: label?.o ?? "",

      flags: label?.f,

      tripType: label?.t,
    };
  }

  mapMessage(message: Message): LiveMessageDto | null {
    /*
     * Deutsche Bahn can return message records that contain only an
     * internal message type/code without any human-readable text.
     * For example, a cause-of-delay record can have `t = "d"` while
     * both `ext` and `int` are empty. Those records are useful to the
     * integration layer, but they are not useful to an operator in the
     * Train Details UI.
     *
     * Prefer external text, then internal text, then distributor text.
     */
    const distributorText = this.safeArray(message.dm)
      .map((item) => item.int?.trim())
      .find((text) => Boolean(text));

    const text =
      message.ext?.trim() ||
      message.int?.trim() ||
      distributorText ||
      "";

    /* Deleted/empty messages must not reach the Operations UI. */
    if (message.del || !text) {
      return null;
    }

    return {
      id: message.id,

      type: message.t,

      text,

      priority: message.pr,
    };
  }

  mapStation(station: StationData): LiveStationDto {
    return {
      eva: station.eva,

      ds100: station.ds100,

      name: station.name,
    };
  }

  mapStations(data: MultipleStationData): LiveStationDto[] {
    return this.safeArray(data.stations.station).map((station) =>
      this.mapStation(station),
    );
  }

  mapStop(stop: TimetableStop): LiveStopDto {
    // =========================
    // Arrival
    // =========================

    const arrivalPlanned = this.parseTimestamp(stop.ar?.pt);

    const arrivalActual = this.parseTimestamp(stop.ar?.ct);

    // =========================
    // Departure
    // =========================

    const departurePlanned = this.parseTimestamp(stop.dp?.pt);

    const departureActual = this.parseTimestamp(stop.dp?.ct);

    // =========================
    // Train label
    // =========================

    const trainLabel = stop.tl ?? stop.ref?.tl ?? stop.ref?.rt?.[0];

    // =========================
    // Route
    // =========================

    const route = this.parseRoute(stop.ar, stop.dp);

    // =========================
    // Messages
    // =========================

    const uniqueMessages = new Map<string, Message>();

    [
      ...this.safeArray(stop.m),

      ...this.safeArray(stop.ar?.m),

      ...this.safeArray(stop.dp?.m),
    ].forEach((message) => {
      uniqueMessages.set(message.id, message);
    });

    // =========================
    // Return LiveStopDto
    // =========================

    return {
      stationEva: stop.eva,

      plannedArrival: arrivalPlanned,

      actualArrival: arrivalActual,

      plannedDeparture: departurePlanned,

      actualDeparture: departureActual,

      plannedPlatform: stop.ar?.pp ?? stop.dp?.pp,

      actualPlatform: stop.ar?.cp ?? stop.dp?.cp,

      arrivalDelayMinutes: this.calculateDelay(arrivalPlanned, arrivalActual),

      departureDelayMinutes: this.calculateDelay(
        departurePlanned,
        departureActual,
      ),

      cancelled: this.isCancelled(stop.ar) || this.isCancelled(stop.dp),

      previousStations: route.previousStations,

      nextStations: route.nextStations,

      origin: route.origin,

      destination: route.destination,

      train: trainLabel
        ? this.mapTrain(trainLabel)
        : {
            trainNumber: "Unknown",

            category: "",

            operator: "",

            flags: undefined,

            tripType: undefined,
          },

      messages: [...uniqueMessages.values()]
        .map((message) => this.mapMessage(message))
        .filter((message): message is LiveMessageDto => message !== null),
    };
  }

  mapTimetable(timetable: Timetable): LiveTimetableDto {
    return {
      stationEva: timetable.eva ?? 0,

      generatedAt: new Date().toISOString(),

      stops: this.safeArray(timetable.s).map((stop) => this.mapStop(stop)),
    };
  }
}

export const deutscheBahnMapper = new DeutscheBahnMapper();
