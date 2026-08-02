import { z } from "zod";

export const createSavedJourneySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Journey name is required.")
    .max(100, "Journey name must not exceed 100 characters."),

  fromStationEva: z
    .number()
    .int()
    .positive(),

  fromStationName: z
    .string()
    .trim()
    .min(1, "From station name is required.")
    .max(100),

  toStationEva: z
    .number()
    .int()
    .positive(),

  toStationName: z
    .string()
    .trim()
    .min(1, "To station name is required.")
    .max(100),
});

export const updateSavedJourneySchema =
  createSavedJourneySchema;

export type CreateSavedJourneyInput =
  z.infer<typeof createSavedJourneySchema>;

export type UpdateSavedJourneyInput =
  z.infer<typeof updateSavedJourneySchema>;