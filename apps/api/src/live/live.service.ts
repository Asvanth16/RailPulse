import { deutscheBahnProvider } from "../integrations/deutsche-bahn";
import { cacheService, CacheKeys, CacheTTL } from "../cache";
import { LiveStationDto, LiveTimetableDto } from "../dto/live";

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

  async getPlannedTimetable(evaNo: string, date: string, hour: string): Promise<LiveTimetableDto> {
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

  async getFullChanges(evaNo: string): Promise<LiveTimetableDto>  {
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
}

export const liveService = new LiveService();
