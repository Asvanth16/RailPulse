import { TrainRunStatus } from "../generated/prisma/enums";
import { BadRequestError } from "../errors/BadRequestError";
import { NotFoundError } from "../errors/NotFoundError";
import { trainRunRepository } from "../repositories/train-run.repository";
import {
  CreateTrainRunInput,
  UpdateTrainRunInput,
} from "../validators/train-run.validator";

export const trainRunService = {
  async create(data: CreateTrainRunInput) {
    const journey = await trainRunRepository.findJourneyById(data.journeyId);

    if (!journey) {
      throw new NotFoundError("Journey not found");
    }

    if (!journey.isActive) {
      throw new BadRequestError("Journey is inactive");
    }

    const existing = await trainRunRepository.findByJourneyAndDate(
      data.journeyId,
      new Date(data.serviceDate),
    );

    if (existing) {
      throw new BadRequestError(
        "Train run already exists for this journey on the given service date.",
      );
    }

    return trainRunRepository.create({
      ...data,
      status: data.status ?? TrainRunStatus.SCHEDULED,
    });
  },

  async getAll() {
    return trainRunRepository.findAll();
  },

  async getById(id: string) {
    const trainRun = await trainRunRepository.findById(id);

    if (!trainRun) {
      throw new NotFoundError("Train run not found");
    }

    return trainRun;
  },

  async update(id: string, data: UpdateTrainRunInput) {
    const trainRun = await trainRunRepository.findById(id);

    if (!trainRun) {
      throw new NotFoundError("Train run not found");
    }

    const newStatus = data.status ?? trainRun.status;

    if (
      data.startedAt &&
      ![
        TrainRunStatus.DEPARTED,
        TrainRunStatus.IN_TRANSIT,
        TrainRunStatus.ARRIVED,
        TrainRunStatus.COMPLETED,
      ].includes(newStatus)
    ) {
      throw new BadRequestError("startedAt can only be set after departure.");
    }

    if (
      data.completedAt &&
      ![TrainRunStatus.ARRIVED, TrainRunStatus.COMPLETED].includes(newStatus)
    ) {
      throw new BadRequestError(
        "completedAt can only be set after arrival or completion.",
      );
    }

    return trainRunRepository.update(id, data);
  },

  async delete(id: string) {
    const trainRun = await trainRunRepository.findById(id);

    if (!trainRun) {
      throw new NotFoundError("Train run not found");
    }

    return trainRunRepository.delete(id);
  },
};
