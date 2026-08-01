import { FavoriteStationDto } from "../dto/favorite-station";
import { favoriteStationRepository } from "../repositories/favorite-station.repository";
import { CreateFavoriteStationInput } from "../validators/favorite-station.validator";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";

export const favoriteStationService = {
  async addFavorite(
    userId: string,
    data: CreateFavoriteStationInput,
  ): Promise<FavoriteStationDto> {
    const existing = await favoriteStationRepository.findByUserAndStation(
      userId,
      data.stationEva,
    );

    if (existing) {
      throw new ConflictError("Station is already in favorites.");
    }

    const favorite = await favoriteStationRepository.create(
      userId,
      data.stationEva,
      data.stationName,
    );

    return {
      stationEva: favorite.stationEva,
      stationName: favorite.stationName,
      createdAt: favorite.createdAt.toISOString(),
    };
  },

  async getFavorites(userId: string): Promise<FavoriteStationDto[]> {
    const favorites = await favoriteStationRepository.findByUserId(userId);

    return favorites.map((favorite) => ({
      stationEva: favorite.stationEva,
      stationName: favorite.stationName,
      createdAt: favorite.createdAt.toISOString(),
    }));
  },

  async removeFavorite(userId: string, stationEva: number): Promise<void> {
    const existing = await favoriteStationRepository.findByUserAndStation(
      userId,
      stationEva,
    );

    if (!existing) {
      throw new NotFoundError("Favorite station not found.");
    }

    await favoriteStationRepository.delete(userId, stationEva);
  },
};
