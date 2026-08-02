import { z } from "zod";

export const createNotificationPreferenceSchema = z.object({
  pushNotifications: z.boolean(),

  emailNotifications: z.boolean(),

  delayAlerts: z.boolean(),

  platformChangeAlerts: z.boolean(),

  departureReminders: z.boolean(),

  reminderMinutes: z
    .number()
    .int()
    .min(1)
    .max(120),
});

export const updateNotificationPreferenceSchema =
  createNotificationPreferenceSchema.partial();

export type CreateNotificationPreferenceInput =
  z.infer<typeof createNotificationPreferenceSchema>;

export type UpdateNotificationPreferenceInput =
  z.infer<typeof updateNotificationPreferenceSchema>;