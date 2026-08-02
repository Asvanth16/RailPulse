import { z } from "zod";

export const createRecentSearchSchema = z.discriminatedUnion(
  "searchType",
  [
    z.object({
      searchType: z.literal("STATION"),

      query: z
        .string()
        .trim()
        .min(1, "Search query is required.")
        .max(100),

      fromStationEva: z.undefined().optional(),
      fromStationName: z.undefined().optional(),

      toStationEva: z.undefined().optional(),
      toStationName: z.undefined().optional(),
    }),

    z.object({
      searchType: z.literal("JOURNEY"),

      fromStationEva: z.number().int().positive(),

      fromStationName: z
        .string()
        .trim()
        .min(1)
        .max(100),

      toStationEva: z.number().int().positive(),

      toStationName: z
        .string()
        .trim()
        .min(1)
        .max(100),

      query: z.undefined().optional(),
    }),
  ],
);

export type CreateRecentSearchInput =
  z.infer<typeof createRecentSearchSchema>;