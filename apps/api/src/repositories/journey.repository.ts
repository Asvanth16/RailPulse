import { Prisma, Journey } from "../generated/prisma/client";
import { prisma } from "../lib/prisma";
import { CreateJourneyInput } from "../validators/journey.validator";

export const journeyRepository = {
  async findByJourneyNumber(journeyNumber: string): Promise<Journey | null> {
    return prisma.journey.findUnique({
      where: {
        journeyNumber,
      },
    });
  },

  async findTrainById(trainId: string) {
    return prisma.train.findUnique({
      where: {
        id: trainId,
      },
    });
  },

  async findStationById(stationId: string) {
    return prisma.station.findUnique({
      where: {
        id: stationId,
      },
    });
  },

  async findJourneyById(id: string) {
    return prisma.journey.findUnique({
      where: {
        id,
      },
      include: {
        train: true,
        stops: {
          include: {
            station: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
  },

  async findAllJourneys() {
    return prisma.journey.findMany({
      include: {
        train: true,
        stops: {
          include: {
            station: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  async findStationsByQuery(query: string) {
    // Split into words so "Berlin Hbf" still matches a station whose
    // official name is "Berlin Hauptbahnhof" — a whole-phrase contains()
    // match would miss that even though it's obviously the same station.
    const words = query
      .split(/\s+/)
      .map((word) => word.trim())
      .filter((word) => word.length > 0);

    if (words.length === 0) return [];

    // German main-station naming is inconsistent between the abbreviation
    // and the spelled-out form — expand each word to include its counterpart
    // so either convention in the seed data matches.
    const SYNONYMS: Record<string, string[]> = {
      hbf: ["hbf", "hauptbahnhof"],
      hauptbahnhof: ["hauptbahnhof", "hbf"],
    };
    const expandedWords = words.map(
      (word) => SYNONYMS[word.toLowerCase()] ?? [word],
    );

    const wordCondition = (variants: string[]) => ({
      OR: variants.flatMap((variant) => [
        { name: { contains: variant, mode: "insensitive" as const } },
        { city: { contains: variant, mode: "insensitive" as const } },
        { code: { contains: variant, mode: "insensitive" as const } },
      ]),
    });

    // Strict pass: every word must match something (precise for common queries).
    const strictMatches = await prisma.station.findMany({
      where: {
        isActive: true,
        AND: expandedWords.map(wordCondition),
      },
    });
    if (strictMatches.length > 0) return strictMatches;

    // Fallback: at least one word matches — better to over-return than to
    // dead-end into "no station matches" when the strict pass was too fussy.
    return prisma.station.findMany({
      where: {
        isActive: true,
        OR: expandedWords.flatMap((variants) =>
          variants.flatMap((variant) => [
            { name: { contains: variant, mode: "insensitive" as const } },
            { city: { contains: variant, mode: "insensitive" as const } },
            { code: { contains: variant, mode: "insensitive" as const } },
          ]),
        ),
      },
    });
  },

  async findDirectJourneysBetweenStations(
    fromStationIds: string[],
    toStationIds: string[],
  ) {
    return prisma.journey.findMany({
      where: {
        isActive: true,
        AND: [
          { stops: { some: { stationId: { in: fromStationIds } } } },
          { stops: { some: { stationId: { in: toStationIds } } } },
        ],
      },
      include: {
        train: true,
        schedules: true,
        stops: {
          include: {
            station: true,
          },
          orderBy: {
            sequence: "asc",
          },
        },
      },
    });
  },

  async deleteJourney(id: string) {
    return prisma.journey.delete({
      where: {
        id,
      },
    });
  },
};
