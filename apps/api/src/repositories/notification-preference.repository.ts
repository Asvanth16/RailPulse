import { prisma } from "../lib/prisma";
import { NotificationPreference } from "../generated/prisma/models";

import {
  CreateNotificationPreferenceInput,
  UpdateNotificationPreferenceInput,
} from "../validators/notification-preference.validator";

export const notificationPreferenceRepository = {
  async create(
    userId: string,
    data: CreateNotificationPreferenceInput,
  ): Promise<NotificationPreference> {
    return prisma.notificationPreference.create({
      data: {
        userId,
        ...data,
      },
    });
  },

  async findByUserId(
    userId: string,
  ): Promise<NotificationPreference | null> {
    return prisma.notificationPreference.findUnique({
      where: {
        userId,
      },
    });
  },

  async update(
    userId: string,
    data: UpdateNotificationPreferenceInput,
  ): Promise<NotificationPreference> {
    return prisma.notificationPreference.update({
      where: {
        userId,
      },
      data,
    });
  },

  async delete(
    userId: string,
  ): Promise<NotificationPreference> {
    return prisma.notificationPreference.delete({
      where: {
        userId,
      },
    });
  },
};