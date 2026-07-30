import { z } from "zod";
import { TrainRunStatus } from "../generated/prisma/enums";

export const createTrainRunSchema = z.object({
  journeyId: z
    .string()
    .trim()
    .min(1, "Journey ID is required"),

  serviceDate: z.string().datetime(),

  status: z.nativeEnum(TrainRunStatus).optional(),
});

export const updateTrainRunSchema = z.object({
  status: z.nativeEnum(TrainRunStatus).optional(),

  startedAt: z.string().datetime().optional(),

  completedAt: z.string().datetime().optional(),

  isActive: z.boolean().optional(),
});

export type CreateTrainRunInput = z.infer<typeof createTrainRunSchema>;
export type UpdateTrainRunInput = z.infer<typeof updateTrainRunSchema>;