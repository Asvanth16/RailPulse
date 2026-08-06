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
    if (!value) return [];
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
    if (!planned || !actual) return undefined;

    const plannedTime = new Date(planned).getTime();
    const actualTime = new Date(actual).getTime();

    // Never return negative delays
    return Math.max(0, Math.round((actualTime - plannedTime) / 60000));
  }

  private isCancelled(event?: Event): boolean {
    return !!event?.clt;
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

  mapMessage(message: Message): LiveMessageDto {
    return {
      id: message.id,
      type: message.t,
      text: message.ext ?? message.int ?? "",
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
    const arrivalPlanned = this.parseTimestamp(stop.ar?.pt);
    const arrivalActual = this.parseTimestamp(stop.ar?.ct);

    const departurePlanned = this.parseTimestamp(stop.dp?.pt);
    const departureActual = this.parseTimestamp(stop.dp?.ct);

    const trainLabel = stop.tl ?? stop.ref?.tl ?? stop.ref?.rt?.[0];

    // Remove duplicate messages
    const uniqueMessages = new Map<string, Message>();

    [
      ...this.safeArray(stop.m),
      ...this.safeArray(stop.ar?.m),
      ...this.safeArray(stop.dp?.m),
    ].forEach((message) => {
      uniqueMessages.set(message.id, message);
    });

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

      train: trainLabel
        ? this.mapTrain(trainLabel)
        : {
            trainNumber: "Unknown",
            category: "",
            operator: "",
            flags: undefined,
            tripType: undefined,
          },

      messages: [...uniqueMessages.values()].map((message) =>
        this.mapMessage(message),
      ),
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
