import { FavoriteStation } from "../generated/prisma/models";
import { FavoriteStationDto } from "../dto/favorite-station";

export const favoriteStationMapper = {
  toDto(station: FavoriteStation): FavoriteStationDto {
    return {
      stationEva: station.stationEva,
      stationName: station.stationName,
      createdAt: station.createdAt.toISOString(),
    };
  },

  toDtoList(stations: FavoriteStation[]): FavoriteStationDto[] {
    return stations.map((station) => this.toDto(station));
  },
};