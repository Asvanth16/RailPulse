import { deutscheBahnProvider } from "../integrations/deutsche-bahn";
import { cacheService, CacheKeys, CacheTTL } from "../cache";
import { LiveStationDto, LiveStopDto, LiveTimetableDto } from "../dto/live";
import { liveTrainMonitor } from "../realtime/monitor/live-train.monitor";
import { anyStationMatches } from "./live.station-match";

export class LiveService {
  async searchStations(query: string): Promise<LiveStationDto[]> {
    const key = CacheKeys.stationSearch(query);

    const cached = await cacheService.get<LiveStationDto[]>(key);

    if (cached) {
      return cached;
    }

    const stations = await deutscheBahnProvider.searchStations(query);

    await cacheService.set(key, stations, CacheTTL.STATION_SEARCH);

    return stations;
  }

  async getPlannedTimetable(
    evaNo: string,
    date: string,
    hour: string,
  ): Promise<LiveTimetableDto> {
    const key = CacheKeys.plannedTimetable(evaNo, date, hour);

    const cached = await cacheService.get<LiveTimetableDto>(key);

    if (cached) {
      return cached;
    }

    const timetable = await deutscheBahnProvider.getPlannedTimetable(
      evaNo,
      date,
      hour,
    );

    await cacheService.set(key, timetable, CacheTTL.PLANNED_TIMETABLE);

    return timetable;
  }

  async getFullChanges(evaNo: string): Promise<LiveTimetableDto> {
    const key = CacheKeys.fullChanges(evaNo);

    const cached = await cacheService.get<LiveTimetableDto>(key);

    if (cached) {
      return cached;
    }

    const timetable = await deutscheBahnProvider.getFullChanges(evaNo);

    await cacheService.set(key, timetable, CacheTTL.FULL_CHANGES);

    return timetable;
  }

  async getRecentChanges(evaNo: string): Promise<LiveTimetableDto> {
    const key = CacheKeys.recentChanges(evaNo);

    const cached = await cacheService.get<LiveTimetableDto>(key);

    if (cached) {
      return cached;
    }

    const timetable = await deutscheBahnProvider.getRecentChanges(evaNo);

    await cacheService.set(key, timetable, CacheTTL.RECENT_CHANGES);

    return timetable;
  }

  async getTrainAtStation(
    evaNo: number,
    trainNumber: string,
  ): Promise<LiveStopDto | null> {
    // No caching here on purpose — this backs a live train-detail view where
    // a passenger wants the current state, not a stale cached one.
    return liveTrainMonitor.findTrainAtStation(evaNo, trainNumber);
  }

  /**
   * Trains departing `evaNo` whose route (from the DB "path" data) passes
   * through a station matching `to`. This is a real route match against the
   * train's actual planned/changed path — not a heuristic — but it only
   * covers direct trains; it won't find a route that needs a transfer.
   */
  async getTrainsToDestination(
    evaNo: string,
    to: string,
  ): Promise<LiveStopDto[]> {
    const timetable = await this.getFullChanges(evaNo);

    return timetable.stops.filter((stop) => {
      const candidates = [
        ...(stop.nextStations ?? []),
        ...(stop.destination ? [stop.destination] : []),
      ];
      return anyStationMatches(candidates, to);
    });
  }
}

export const liveService = new LiveService();
