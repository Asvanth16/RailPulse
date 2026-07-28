import { z } from "zod";
import { ScheduleType } from "../generated/prisma/enums";

export const createScheduleSchema = z
  .object({
    journeyId: z
      .string()
      .trim()
      .min(1, "Journey ID is required"),

    scheduleType: z.nativeEnum(ScheduleType),

    monday: z.boolean().default(false),
    tuesday: z.boolean().default(false),
    wednesday: z.boolean().default(false),
    thursday: z.boolean().default(false),
    friday: z.boolean().default(false),
    saturday: z.boolean().default(false),
    sunday: z.boolean().default(false),

    effectiveFrom: z.string().datetime(),

    effectiveUntil: z
      .string()
      .datetime()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // effectiveUntil must be after effectiveFrom
    if (
      data.effectiveUntil &&
      new Date(data.effectiveUntil) <= new Date(data.effectiveFrom)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "effectiveUntil must be after effectiveFrom",
        path: ["effectiveUntil"],
      });
    }

    // CUSTOM requires at least one selected day
    if (data.scheduleType === ScheduleType.CUSTOM) {
      const hasDay =
        data.monday ||
        data.tuesday ||
        data.wednesday ||
        data.thursday ||
        data.friday ||
        data.saturday ||
        data.sunday;

      if (!hasDay) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "At least one operating day must be selected for CUSTOM schedules",
          path: ["scheduleType"],
        });
      }
    }
  });

export const updateScheduleSchema = z.object({
  journeyId: z.string().trim().min(1).optional(),

  scheduleType: z.nativeEnum(ScheduleType).optional(),

  monday: z.boolean().optional(),
  tuesday: z.boolean().optional(),
  wednesday: z.boolean().optional(),
  thursday: z.boolean().optional(),
  friday: z.boolean().optional(),
  saturday: z.boolean().optional(),
  sunday: z.boolean().optional(),

  effectiveFrom: z.string().datetime().optional(),

  effectiveUntil: z.string().datetime().optional(),
});

export type CreateScheduleInput = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleInput = z.infer<typeof updateScheduleSchema>;