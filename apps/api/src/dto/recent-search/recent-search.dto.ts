export interface RecentSearchDto {
  id: string;

  searchType: "STATION" | "JOURNEY";

  query?: string;

  fromStationEva?: number;
  fromStationName?: string;

  toStationEva?: number;
  toStationName?: string;

  createdAt: string;
}