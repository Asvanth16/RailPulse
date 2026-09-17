import { prisma } from "../lib/prisma";

import { Alert } from "../generated/prisma/models";

import { AlertType } from "../generated/prisma/enums";

import {
  CreateAlertInput,
  UpdateAlertInput,
} from "../validators/alert.validator";

export const alertRepository = {
  // ========================================
  // Create
  // ========================================

  async create(userId: string, data: CreateAlertInput): Promise<Alert> {
    return prisma.alert.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  // ========================================
  // Find by ID
  // ========================================

  async findById(id: string): Promise<Alert | null> {
    return prisma.alert.findUnique({
      where: {
        id,
      },
    });
  },

  // ========================================
  // Find by user
  // ========================================

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

  // ========================================
  // Enabled alerts by type
  // ========================================

  async findEnabledByType(alertType: AlertType) {
    return prisma.alert.findMany({
      where: {
        alertType,
        isEnabled: true,
      },

      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  },

  // ========================================
  // Enabled monitor stations
  // ========================================

  async findEnabledMonitorStations(): Promise<number[]> {
    const alerts = await prisma.alert.findMany({
      where: {
        isEnabled: true,

        monitorStationEva: {
          not: null,
        },
      },

      select: {
        monitorStationEva: true,
      },

      distinct: ["monitorStationEva"],
    });

    return alerts
      .map((alert) => alert.monitorStationEva)
      .filter((eva): eva is number => eva !== null);
  },

  // ========================================
  // Trigger alert
  // ========================================

  async markTriggered(id: string, triggeredAt: Date): Promise<void> {
    await prisma.alert.update({
      where: {
        id,
      },

      data: {
        isTriggered: true,
        lastTriggeredAt: triggeredAt,
      },
    });
  },

  // ========================================
  // Reset triggered state
  // ========================================

  async resetTriggered(id: string): Promise<void> {
    await prisma.alert.update({
      where: {
        id,
      },

      data: {
        isTriggered: false,
      },
    });
  },

  // ========================================
  // Complete alert
  // ========================================

  async completeAlert(id: string): Promise<void> {
    await prisma.alert.update({
      where: {
        id,
      },

      data: {
        isEnabled: false,
        isTriggered: false,
      },
    });
  },

  // ========================================
  // Last checked
  // ========================================

  async updateLastChecked(id: string): Promise<void> {
    await prisma.alert.update({
      where: {
        id,
      },

      data: {
        lastCheckedAt: new Date(),
      },
    });
  },

  // ========================================
  // Update
  // ========================================

  async update(id: string, data: UpdateAlertInput): Promise<Alert> {
    return prisma.alert.update({
      where: {
        id,
      },

      data,
    });
  },

  // ========================================
  // Delete
  // ========================================

  async delete(id: string): Promise<Alert> {
    return prisma.alert.delete({
      where: {
        id,
      },
    });
  },

  // ========================================
  // Duplicate detection
  // ========================================

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

  // ========================================
  // Operations - all alerts
  // ========================================

  async findAllForOperations(): Promise<Alert[]> {
    return prisma.alert.findMany({
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  async getOperationsStatistics() {
    const [
      total,
      enabled,
      triggered,
      disabled,
      delay,
      platformChange,
      cancellation,
      departureReminder,
      arrivalReminder,
    ] = await Promise.all([
      prisma.alert.count(),

      prisma.alert.count({
        where: {
          isEnabled: true,
        },
      }),

      prisma.alert.count({
        where: {
          isTriggered: true,
        },
      }),

      prisma.alert.count({
        where: {
          isEnabled: false,
        },
      }),

      prisma.alert.count({
        where: {
          alertType: "DELAY",
        },
      }),

      prisma.alert.count({
        where: {
          alertType: "PLATFORM_CHANGE",
        },
      }),

      prisma.alert.count({
        where: {
          alertType: "CANCELLATION",
        },
      }),

      prisma.alert.count({
        where: {
          alertType: "DEPARTURE_REMINDER",
        },
      }),

      prisma.alert.count({
        where: {
          alertType: "ARRIVAL_REMINDER",
        },
      }),
    ]);

    return {
      total,
      enabled,
      triggered,
      disabled,
      byType: {
        DELAY: delay,
        PLATFORM_CHANGE: platformChange,
        CANCELLATION: cancellation,
        DEPARTURE_REMINDER: departureReminder,
        ARRIVAL_REMINDER: arrivalReminder,
      },
    };
  },
};
