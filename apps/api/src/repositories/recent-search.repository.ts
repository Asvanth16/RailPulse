import { prisma } from "../lib/prisma";
import { RecentSearch } from "../generated/prisma/models";

import { CreateRecentSearchInput } from "../validators/recent-search.validator";

export const recentSearchRepository = {
  async create(
    userId: string,
    data: CreateRecentSearchInput,
  ): Promise<RecentSearch> {
    return prisma.recentSearch.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  async findByUserId(userId: string): Promise<RecentSearch[]> {
    return prisma.recentSearch.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async countByUser(userId: string): Promise<number> {
    return prisma.recentSearch.count({
      where: {
        userId,
      },
    });
  },

  async findOldestByUser(userId: string): Promise<RecentSearch | null> {
    return prisma.recentSearch.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async findById(id: string) {
    return prisma.recentSearch.findUnique({
      where: {
        id,
      },
    });
  },

  async delete(id: string): Promise<RecentSearch> {
    return prisma.recentSearch.delete({
      where: {
        id,
      },
    });
  },

  async findDuplicate(
    userId: string,
    data: CreateRecentSearchInput,
  ): Promise<RecentSearch | null> {
    if (data.searchType === "STATION") {
      return prisma.recentSearch.findUnique({
        where: {
          userId_searchType_query: {
            userId,
            searchType: data.searchType,
            query: data.query!,
          },
        },
      });
    }

    return prisma.recentSearch.findUnique({
      where: {
        userId_searchType_fromStationEva_toStationEva: {
          userId,
          searchType: data.searchType,
          fromStationEva: data.fromStationEva!,
          toStationEva: data.toStationEva!,
        },
      },
    });
  },
};
