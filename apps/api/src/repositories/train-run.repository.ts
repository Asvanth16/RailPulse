import { prisma } from "../lib/prisma";
import { TrainRun } from "../generated/prisma/models";
import {
  CreateTrainRunInput,
  UpdateTrainRunInput,
} from "../validators/train-run.validator";

export const trainRunRepository = {
  async findJourneyById(journeyId: string) {
    return prisma.journey.findUnique({
      where: {
        id: journeyId,
      },
    });
  },

  async findByJourneyAndDate(journeyId: string, serviceDate: Date) {
    return prisma.trainRun.findFirst({
      where: {
        journeyId,
        serviceDate,
      },
    });
  },

  async create(data: CreateTrainRunInput): Promise<TrainRun> {
    return prisma.trainRun.create({
      data: {
        journeyId: data.journeyId,
        serviceDate: new Date(data.serviceDate),
        status: data.status,
      },
    });
  },

  async findById(id: string) {
    return prisma.trainRun.findUnique({
      where: {
        id,
      },
      include: {
        journey: {
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
            schedules: true,
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.trainRun.findMany({
      include: {
        journey: {
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
            schedules: true,
          },
        },
      },
      orderBy: [
        {
          serviceDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
    });
  },

  async update(id: string, data: UpdateTrainRunInput) {
    return prisma.trainRun.update({
      where: {
        id,
      },
      data: {
        ...data,
        startedAt: data.startedAt
          ? new Date(data.startedAt)
          : undefined,
        completedAt: data.completedAt
          ? new Date(data.completedAt)
          : undefined,
      },
    });
  },

  async delete(id: string) {
    return prisma.trainRun.delete({
      where: {
        id,
      },
    });
  },
};