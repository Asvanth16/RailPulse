import { RecentSearch } from "../generated/prisma/models";
import { RecentSearchDto } from "../dto/recent-search";

export const recentSearchMapper = {
  toDto(search: RecentSearch): RecentSearchDto {
    return {
      id: search.id,

      searchType: search.searchType,

      query: search.query ?? undefined,

      fromStationEva: search.fromStationEva ?? undefined,
      fromStationName: search.fromStationName ?? undefined,

      toStationEva: search.toStationEva ?? undefined,
      toStationName: search.toStationName ?? undefined,

      createdAt: search.createdAt.toISOString(),
    };
  },

  toDtoList(searches: RecentSearch[]): RecentSearchDto[] {
    return searches.map((search) => this.toDto(search));
  },
};