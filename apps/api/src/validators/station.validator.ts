import { z } from "zod";

export const createStationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Station code must be at least 2 characters")
    .max(10, "Station code cannot exceed 10 characters"),

  name: z
    .string()
    .trim()
    .min(3, "Station name must be at least 3 characters"),

  city: z
    .string()
    .trim()
    .min(2, "City is required"),

  state: z
    .string()
    .trim()
    .min(2, "State is required"),

  country: z
    .string()
    .trim()
    .min(2, "Country is required"),

  latitude: z
    .number()
    .min(-90)
    .max(90),

  longitude: z
    .number()
    .min(-180)
    .max(180),
});

export const updateStationSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(10)
    .optional(),

  name: z
    .string()
    .trim()
    .min(3)
    .optional(),

  city: z
    .string()
    .trim()
    .min(2)
    .optional(),

  state: z
    .string()
    .trim()
    .min(2)
    .optional(),

  country: z
    .string()
    .trim()
    .min(2)
    .optional(),

  latitude: z
    .number()
    .min(-90)
    .max(90)
    .optional(),

  longitude: z
    .number()
    .min(-180)
    .max(180)
    .optional(),

  isActive: z
    .boolean()
    .optional(),
});

export type CreateStationInput = z.infer<typeof createStationSchema>;
export type UpdateStationInput = z.infer<typeof updateStationSchema>;