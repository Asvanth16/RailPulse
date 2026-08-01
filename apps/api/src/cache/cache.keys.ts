export class CacheKeys {
  static stationSearch(query: string): string {
    return `stations:${query.toLowerCase()}`;
  }

  static plannedTimetable(
    evaNo: string,
    date: string,
    hour: string,
  ): string {
    return `timetable:${evaNo}:${date}:${hour}`;
  }

  static fullChanges(evaNo: string): string {
    return `changes:full:${evaNo}`;
  }

  static recentChanges(evaNo: string): string {
    return `changes:recent:${evaNo}`;
  }
}