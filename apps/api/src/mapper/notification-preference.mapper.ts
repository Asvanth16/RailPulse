import { NotificationPreference } from "../generated/prisma/models";

import { NotificationPreferenceDto } from "../dto/notification-preference";

export const notificationPreferenceMapper = {
  toDto(
    preference: NotificationPreference,
  ): NotificationPreferenceDto {
    return {
      id: preference.id,

      pushNotifications:
        preference.pushNotifications,

      emailNotifications:
        preference.emailNotifications,

      delayAlerts: preference.delayAlerts,

      platformChangeAlerts:
        preference.platformChangeAlerts,

      departureReminders:
        preference.departureReminders,

      reminderMinutes:
        preference.reminderMinutes,

      createdAt:
        preference.createdAt.toISOString(),

      updatedAt:
        preference.updatedAt.toISOString(),
    };
  },
};