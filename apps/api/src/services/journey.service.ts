import { prisma } from "../lib/prisma";
import { Journey } from "../generated/prisma/models";
import { NotFoundError } from "../errors/NotFoundError";
import { BadRequestError } from "../errors/BadRequestError";
import { journeyRepository } from "../repositories/journey.repository";
import { CreateJourneyInput } from "../validators/journey.validator";

export const journeyService = {
  async createJourney(data: CreateJourneyInput) {
    // ==========================
    // Validate Train
    // ==========================

    const train = await journeyRepository.findTrainById(data.trainId);

    if (!train) {
      throw new NotFoundError("Train not found");
    }

    if (!train.isActive) {
      throw new BadRequestError("Train is inactive");
    }

    // ==========================
    // Validate Stations
    // ==========================

    for (const stop of data.stops) {
      const station = await journeyRepository.findStationById(stop.stationId);

      if (!station) {
        throw new NotFoundError(`Station not found: ${stop.stationId}`);
      }

      if (!station.isActive) {
        throw new BadRequestError(`Station is inactive: ${station.name}`);
      }
    }

    // ==========================
    // Validate Stop Sequence
    // ==========================

    const sortedStops = [...data.stops].sort((a, b) => a.sequence - b.sequence);

    for (let i = 0; i < sortedStops.length; i++) {
      if (sortedStops[i].sequence !== i + 1) {
        throw new BadRequestError(
          "Stop sequence must start from 1 and be continuous",
        );
      }
    }

    // ==========================
    // Validate Times
    // ==========================

    for (let i = 0; i < sortedStops.length; i++) {
      const stop = sortedStops[i];

      const arrival = stop.arrivalTime ? new Date(stop.arrivalTime) : null;

      const departure = stop.departureTime
        ? new Date(stop.departureTime)
        : null;

      // First stop
      if (i === 0) {
        if (!departure) {
          throw new BadRequestError("First stop must have departure time");
        }

        if (arrival) {
          throw new BadRequestError("First stop cannot have arrival time");
        }
      }

      // Last stop
      else if (i === sortedStops.length - 1) {
        if (!arrival) {
          throw new BadRequestError("Last stop must have arrival time");
        }

        if (departure) {
          throw new BadRequestError("Last stop cannot have departure time");
        }
      }

      // Intermediate stop
      else {
        if (!arrival || !departure) {
          throw new BadRequestError(
            "Intermediate stops require arrival and departure times",
          );
        }

        if (arrival >= departure) {
          throw new BadRequestError(
            "Arrival time must be before departure time",
          );
        }
      }
    }

    // Check chronological order
    let previousTime: Date | null = null;

    for (const stop of sortedStops) {
      if (stop.arrivalTime) {
        const arrival = new Date(stop.arrivalTime);

        if (previousTime && arrival <= previousTime) {
          throw new BadRequestError(
            "Journey times must be in chronological order",
          );
        }

        previousTime = arrival;
      }

      if (stop.departureTime) {
        const departure = new Date(stop.departureTime);

        if (previousTime && departure < previousTime) {
          throw new BadRequestError(
            "Journey times must be in chronological order",
          );
        }

        previousTime = departure;
      }
    }

    // ==========================
    // Generate Journey Number
    // ==========================

    const today = new Date();

    const datePart =
      today.getFullYear().toString() +
      String(today.getMonth() + 1).padStart(2, "0") +
      String(today.getDate()).padStart(2, "0");

    const todaysJourneys = await prisma.journey.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
          lt: new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate() + 1,
          ),
        },
      },
    });

    const sequence = String(todaysJourneys + 1).padStart(4, "0");

    const journeyNumber = `JRN-${datePart}-${sequence}`;

    // ==========================
    // Create Journey + Stops
    // ==========================

    const createdJourney = await prisma.$transaction(async (tx) => {
      const journey = await tx.journey.create({
        data: {
          journeyNumber,
          trainId: data.trainId,
        },
      });

      await tx.journeyStop.createMany({
        data: sortedStops.map((stop) => ({
          journeyId: journey.id,
          stationId: stop.stationId,
          sequence: stop.sequence,
          arrivalTime: stop.arrivalTime ? new Date(stop.arrivalTime) : null,
          departureTime: stop.departureTime
            ? new Date(stop.departureTime)
            : null,
          platform: stop.platform ?? null,
        })),
      });

      return tx.journey.findUniqueOrThrow({
        where: {
          id: journey.id,
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
    });

    return createdJourney;
  },

  async getAllJourneys() {
    return journeyRepository.findAllJourneys();
  },

  async getJourneyById(id: string) {
    const journey = await journeyRepository.findJourneyById(id);

    if (!journey) {
      throw new NotFoundError("Journey not found");
    }

    return journey;
  },

  async deleteJourney(id: string) {
    const journey = await journeyRepository.findJourneyById(id);

    if (!journey) {
      throw new NotFoundError("Journey not found");
    }

    await journeyRepository.deleteJourney(id);
  },
};
