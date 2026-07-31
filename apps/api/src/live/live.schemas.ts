import { z } from "zod";

/**
 * GET /api/live/stations/search?q=Berlin
 */
export const stationSearchSchema = z.object({
  query: z.object({
    q: z
      .string()
      .trim()
      .min(2, "Search query must contain at least 2 characters")
      .max(100),
  }),
});

/**
 * GET /api/live/timetable/:evaNo/:date/:hour
 *
 * date -> YYMMDD
 * hour -> HH
 */
export const plannedTimetableSchema = z.object({
  params: z.object({
    evaNo: z.string().regex(/^\d+$/, "Invalid EVA number"),

    date: z.string().regex(
      /^\d{6}$/,
      "Date must be in YYMMDD format",
    ),

    hour: z.string().regex(
      /^(0\d|1\d|2[0-3])$/,
      "Hour must be between 00 and 23",
    ),
  }),
});

/**
 * GET /api/live/changes/full/:evaNo
 */
export const fullChangesSchema = z.object({
  params: z.object({
    evaNo: z.string().regex(/^\d+$/, "Invalid EVA number"),
  }),
});

/**
 * GET /api/live/changes/recent/:evaNo
 */
export const recentChangesSchema = z.object({
  params: z.object({
    evaNo: z.string().regex(/^\d+$/, "Invalid EVA number"),
  }),
});