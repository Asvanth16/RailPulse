import { prisma } from "../lib/prisma";
import { SavedJourney } from "../generated/prisma/models";
import { CreateSavedJourneyInput } from "../validators/saved-journey.validator";

export const savedJourneyRepository = {
  async create(
    userId: string,
    data: CreateSavedJourneyInput,
  ): Promise<SavedJourney> {
    return prisma.savedJourney.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  async findByUserId(userId: string): Promise<SavedJourney[]> {
    return prisma.savedJourney.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findById(id: string): Promise<SavedJourney | null> {
    return prisma.savedJourney.findUnique({
      where: {
        id,
      },
    });
  },

  async findByRoute(
    userId: string,
    fromStationEva: number,
    toStationEva: number,
  ) {
    return prisma.savedJourney.findUnique({
      where: {
        userId_fromStationEva_toStationEva: {
          userId,
          fromStationEva,
          toStationEva,
        },
      },
    });
  },

  async update(
    id: string,
    data: CreateSavedJourneyInput,
  ): Promise<SavedJourney> {
    return prisma.savedJourney.update({
      where: {
        id,
      },
      data,
    });
  },

  async delete(id: string): Promise<SavedJourney> {
    return prisma.savedJourney.delete({
      where: {
        id,
      },
    });
  },
};
