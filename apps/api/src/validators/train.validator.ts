import { z } from "zod";

export const createTrainSchema = z.object({
  trainNumber: z
    .string()
    .trim()
    .min(1, "Train number is required")
    .max(20, "Train number is too long"),

  trainName: z
    .string()
    .trim()
    .min(2, "Train name is required")
    .max(100, "Train name is too long"),

  trainType: z.enum([
    "ICE",
    "IC",
    "EC",
    "RE",
    "RB",
  ]),

  operator: z
    .string()
    .trim()
    .min(2, "Operator is required")
    .max(100, "Operator name is too long"),
});

export const updateTrainSchema = z.object({
  trainNumber: z
    .string()
    .trim()
    .min(1, "Train number is required")
    .max(20, "Train number is too long")
    .optional(),

  trainName: z
    .string()
    .trim()
    .min(2, "Train name is required")
    .max(100, "Train name is too long")
    .optional(),

  trainType: z
    .enum(["ICE", "IC", "EC", "RE", "RB"])
    .optional(),

  operator: z
    .string()
    .trim()
    .min(2, "Operator is required")
    .max(100, "Operator name is too long")
    .optional(),

  isActive: z.boolean().optional(),
});

export type UpdateTrainInput = z.infer<typeof updateTrainSchema>;

export type CreateTrainInput = z.infer<typeof createTrainSchema>;