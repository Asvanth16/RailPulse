import { z } from "zod";

const journeyStopSchema = z.object({
  stationId: z
    .string()
    .trim()
    .min(1, "Station ID is required"),

  sequence: z
    .number()
    .int("Sequence must be an integer")
    .positive("Sequence must be greater than 0"),

  arrivalTime: z
    .string()
    .datetime()
    .optional(),

  departureTime: z
    .string()
    .datetime()
    .optional(),

  platform: z
    .string()
    .trim()
    .max(10, "Platform is too long")
    .optional(),
});

export const createJourneySchema = z.object({
  trainId: z
    .string()
    .trim()
    .min(1, "Train ID is required"),

  stops: z
    .array(journeyStopSchema)
    .min(2, "A journey must have at least 2 stops")
    .max(100, "A journey cannot have more than 100 stops"),
});

export type CreateJourneyInput = z.infer<typeof createJourneySchema>;