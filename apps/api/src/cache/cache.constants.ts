export const CacheTTL = {
  STATION_SEARCH: 60 * 60 * 24, // 24 hours

  PLANNED_TIMETABLE: 60, // 1 minute

  FULL_CHANGES: 30, // 30 seconds

  RECENT_CHANGES: 15, // 15 seconds
} as const;