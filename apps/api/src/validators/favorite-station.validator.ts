import { z } from "zod";

export const createFavoriteStationSchema = z.object({
  stationEva: z
    .number()
    .int()
    .positive(),

  stationName: z
    .string()
    .trim()
    .min(1, "Station name is required.")
    .max(100, "Station name must not exceed 100 characters."),
});

export type CreateFavoriteStationInput =
  z.infer<typeof createFavoriteStationSchema>;