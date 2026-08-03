import { prisma } from "../lib/prisma";
import { Alert } from "../generated/prisma/models";
import { AlertType } from "../generated/prisma/enums";

import {
  CreateAlertInput,
  UpdateAlertInput,
} from "../validators/alert.validator";

export const alertRepository = {
  async create(userId: string, data: CreateAlertInput): Promise<Alert> {
    return prisma.alert.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  async findById(id: string): Promise<Alert | null> {
    return prisma.alert.findUnique({
      where: {
        id,
      },
    });
  },

  async findByUserId(userId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findEnabledByType(alertType: AlertType) {
    return prisma.alert.findMany({
      where: {
        alertType,
        isEnabled: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  },

  async update(id: string, data: UpdateAlertInput): Promise<Alert> {
    return prisma.alert.update({
      where: {
        id,
      },
      data,
    });
  },

  async delete(id: string): Promise<Alert> {
    return prisma.alert.delete({
      where: {
        id,
      },
    });
  },

  async findDuplicate(
    userId: string,
    data: CreateAlertInput,
  ): Promise<Alert | null> {
    return prisma.alert.findFirst({
      where: {
        userId,

        trainNumber: data.trainNumber ?? null,

        journeyId: data.journeyId ?? null,

        fromStationEva: data.fromStationEva ?? null,

        toStationEva: data.toStationEva ?? null,

        alertType: data.alertType,
      },
    });
  },
};
