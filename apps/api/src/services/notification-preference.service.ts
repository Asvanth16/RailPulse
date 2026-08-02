import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";

import { NotificationPreferenceDto } from "../dto/notification-preference";
import { notificationPreferenceMapper } from "../mapper/notification-preference.mapper";
import { notificationPreferenceRepository } from "../repositories/notification-preference.repository";

import {
  CreateNotificationPreferenceInput,
  UpdateNotificationPreferenceInput,
} from "../validators/notification-preference.validator";

export const notificationPreferenceService = {
  async create(
    userId: string,
    data: CreateNotificationPreferenceInput,
  ): Promise<NotificationPreferenceDto> {
    const existing =
      await notificationPreferenceRepository.findByUserId(userId);

    if (existing) {
      throw new ConflictError("Notification preferences already exist.");
    }

    const preference = await notificationPreferenceRepository.create(
      userId,
      data,
    );

    return notificationPreferenceMapper.toDto(preference);
  },

  async findByUserId(userId: string): Promise<NotificationPreferenceDto> {
    const preference =
      await notificationPreferenceRepository.findByUserId(userId);

    if (!preference) {
      return {
        pushNotifications: true,
        emailNotifications: true,
        delayAlerts: true,
        platformChangeAlerts: true,
        departureReminders: true,
        reminderMinutes: 15,
      };
    }

    return notificationPreferenceMapper.toDto(preference);
  },

  async update(
    userId: string,
    data: UpdateNotificationPreferenceInput,
  ): Promise<NotificationPreferenceDto> {
    const existing =
      await notificationPreferenceRepository.findByUserId(userId);

    if (!existing) {
      throw new NotFoundError("Notification preferences not found.");
    }

    const updated = await notificationPreferenceRepository.update(userId, data);

    return notificationPreferenceMapper.toDto(updated);
  },

  async delete(userId: string): Promise<void> {
    const existing =
      await notificationPreferenceRepository.findByUserId(userId);

    if (!existing) {
      throw new NotFoundError("Notification preferences not found.");
    }

    await notificationPreferenceRepository.delete(userId);
  },
};
