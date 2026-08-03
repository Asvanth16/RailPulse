import { z } from "zod";

export const createAlertSchema = z.object({
  trainNumber: z.string().trim().optional(),

  journeyId: z.string().trim().optional(),

  fromStationEva: z.number().int().optional(),
  fromStationName: z.string().trim().optional(),

  toStationEva: z.number().int().optional(),
  toStationName: z.string().trim().optional(),

  monitorStationEva: z.number().int().optional(),
  monitorStationName: z.string().trim().optional(),

  alertType: z.enum([
    "DELAY",
    "PLATFORM_CHANGE",
    "CANCELLATION",
    "DEPARTURE_REMINDER",
    "ARRIVAL_REMINDER",
  ]),
});

export const updateAlertSchema = z.object({
  isEnabled: z.boolean().optional(),
});

export type CreateAlertInput = z.infer<typeof createAlertSchema>;

export type UpdateAlertInput = z.infer<typeof updateAlertSchema>;
