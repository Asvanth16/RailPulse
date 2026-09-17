import { prisma } from "../lib/prisma";
import { TrainType } from "../generated/prisma/enums";

interface CreateOperationalHistoryInput {
  trainNumber: string;
  stationEva?: number | null;
  type:
    "DELAY_CHANGED" | "PLATFORM_CHANGED" | "CANCELLATION" | "STATUS_CHANGED";
  previousValue?: string | null;
  currentValue?: string | null;
  message: string;
  occurredAt?: Date;
}

export const operationalHistoryRepository = {
  async resolveTrainRun(
    trainNumber: string,
    occurredAt?: Date,
  ) {
    const existingRun = await prisma.trainRun.findFirst({
      where: {
        journey: {
          train: {
            trainNumber,
          },
        },
        isActive: true,
      },

      orderBy: {
        serviceDate: "desc",
      },
    }) ?? await prisma.trainRun.findFirst({
      where: {
        journey: {
          train: {
            trainNumber,
          },
        },
      },

      orderBy: {
        serviceDate: "desc",
      },
    });

    if (existingRun) {
      return existingRun;
    }

    /*
     * Timetables API trains are external live entities and often have no
     * pre-created business Train/Journey/TrainRun records. OperationalHistory
     * requires a TrainRun foreign key, so create a minimal, explicitly
     * live-timetable tracking run only when that internal record is missing.
     * This preserves the external event as history instead of dropping it.
     */
    const train = await prisma.train.upsert({
      where: {
        trainNumber,
      },

      update: {},

      create: {
        trainNumber,
        trainName: `Live timetable train ${trainNumber}`,
        trainType: TrainType.RE,
        operator: "External timetable",
      },
    });

    const journeyNumber = `LIVE-${trainNumber}`;

    const journey = await prisma.journey.upsert({
      where: {
        journeyNumber,
      },

      update: {},

      create: {
        journeyNumber,
        trainId: train.id,
      },
    });

    return prisma.trainRun.create({
      data: {
        journeyId: journey.id,
        serviceDate: occurredAt ?? new Date(),
      },
    });
  },

  async findByTrainNumber(trainNumber: string, stationEva?: number) {
    return prisma.operationalHistory.findMany({
      where: {
        trainRun: {
          journey: {
            train: {
              trainNumber,
            },
          },
        },

        ...(stationEva !== undefined
          ? {
              stationEva,
            }
          : {}),
      },

      orderBy: {
        occurredAt: "desc",
      },
    });
  },

  async findRecent(limit: number) {
    return prisma.operationalHistory.findMany({
      include: {
        trainRun: {
          include: {
            journey: {
              include: {
                train: true,
              },
            },
          },
        },
      },

      orderBy: {
        occurredAt: "desc",
      },

      take: limit,
    });
  },

  async create(input: CreateOperationalHistoryInput) {
    const trainRun = await this.resolveTrainRun(
      input.trainNumber,
      input.occurredAt,
    );

    return prisma.operationalHistory.create({
      data: {
        trainRunId: trainRun.id,

        stationEva: input.stationEva ?? null,

        type: input.type,

        previousValue: input.previousValue ?? null,

        currentValue: input.currentValue ?? null,

        message: input.message,

        occurredAt: input.occurredAt ?? new Date(),
      },
    });
  },

  async createInitialIfMissing(input: CreateOperationalHistoryInput) {
    /*
     * Initial observations are only created once for a TrainRun +
     * station + event type + current value. This prevents duplicate
     * records if the Redis live-state cache expires and the same train
     * is observed again.
     */
    const trainRun = await this.resolveTrainRun(
      input.trainNumber,
      input.occurredAt,
    );

    const existing = await prisma.operationalHistory.findFirst({
      where: {
        trainRunId: trainRun.id,
        stationEva: input.stationEva ?? null,
        type: input.type,
        previousValue: null,
        currentValue: input.currentValue ?? null,
      },

      orderBy: {
        occurredAt: "desc",
      },
    });

    if (existing) {
      return existing;
    }

    return prisma.operationalHistory.create({
      data: {
        trainRunId: trainRun.id,
        stationEva: input.stationEva ?? null,
        type: input.type,
        previousValue: null,
        currentValue: input.currentValue ?? null,
        message: input.message,
        occurredAt: input.occurredAt ?? new Date(),
      },
    });
  },
};
