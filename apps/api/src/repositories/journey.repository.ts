import { Prisma, Journey } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { CreateJourneyInput } from "../validators/journey.validator";

export const journeyRepository = {
  async findByJourneyNumber(journeyNumber: string): Promise<Journey | null> {
    return prisma.journey.findUnique({
      where: {
        journeyNumber,
      },
    });
  },

  async findTrainById(trainId: string) {
    return prisma.train.findUnique({
      where: {
        id: trainId,
      },
    });
  },

  async findStationById(stationId: string) {
    return prisma.station.findUnique({
      where: {
        id: stationId,
      },
    });
  },

  async findJourneyById(id: string) {
    return prisma.journey.findUnique({
      where: {
        id,
      },
      include: {
        train: true,
        stops: {
          include: {
            station: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
  },

  async findAllJourneys() {
    return prisma.journey.findMany({
      include: {
        train: true,
        stops: {
          include: {
            station: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async deleteJourney(id: string) {
    return prisma.journey.delete({
      where: {
        id,
      },
    });
  },
};