import { prisma } from "../lib/prisma";
import { Schedule } from "../generated/prisma/models";
import { CreateScheduleInput, UpdateScheduleInput } from "../validators/schedule.validator";

export const scheduleRepository = {
  async findJourneyById(journeyId: string) {
    return prisma.journey.findUnique({
      where: {
        id: journeyId,
      },
    });
  },

  async create(data: CreateScheduleInput): Promise<Schedule> {
    return prisma.schedule.create({
      data: {
        journeyId: data.journeyId,
        scheduleType: data.scheduleType,

        monday: data.monday,
        tuesday: data.tuesday,
        wednesday: data.wednesday,
        thursday: data.thursday,
        friday: data.friday,
        saturday: data.saturday,
        sunday: data.sunday,

        effectiveFrom: new Date(data.effectiveFrom),
        effectiveUntil: data.effectiveUntil
          ? new Date(data.effectiveUntil)
          : null,
      },
    });
  },

  async findById(id: string) {
    return prisma.schedule.findUnique({
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
          },
        },
      },
    });
  },

  async findAll() {
    return prisma.schedule.findMany({
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async update(id: string, data: UpdateScheduleInput) {
    return prisma.schedule.update({
      where: {
        id,
      },
      data,
    });
  },

  async delete(id: string) {
    return prisma.schedule.delete({
      where: {
        id,
      },
    });
  },
};