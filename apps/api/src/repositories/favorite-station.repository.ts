import { prisma } from "../lib/prisma";
import { FavoriteStation } from "../generated/prisma/models";

export const favoriteStationRepository = {
  async create(
    userId: string,
    stationEva: number,
    stationName: string,
  ): Promise<FavoriteStation> {
    return prisma.favoriteStation.create({
      data: {
        userId,
        stationEva,
        stationName,
      },
    });
  },

  async findByUserId(
    userId: string,
  ): Promise<FavoriteStation[]> {
    return prisma.favoriteStation.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findByUserAndStation(
    userId: string,
    stationEva: number,
  ): Promise<FavoriteStation | null> {
    return prisma.favoriteStation.findUnique({
      where: {
        userId_stationEva: {
          userId,
          stationEva,
        },
      },
    });
  },

  async delete(
    userId: string,
    stationEva: number,
  ): Promise<FavoriteStation> {
    return prisma.favoriteStation.delete({
      where: {
        userId_stationEva: {
          userId,
          stationEva,
        },
      },
    });
  },
};