import { CreateTrainInput, UpdateTrainInput } from "../validators/train.validator";
import { trainRepository } from "../repositories/train.repository";
import { ConflictError } from "../errors/ConflictError";
import { NotFoundError } from "../errors/NotFoundError";

export const trainService = {
  async create(data: CreateTrainInput) {
    const existingTrain = await trainRepository.findByTrainNumber(
      data.trainNumber
    );

    if (existingTrain) {
      throw new ConflictError("Train number already exists");
    }

    return trainRepository.create(data);
  },

  async getAll() {
    return trainRepository.findAll();
  },

  async getById(id: string) {
    const train = await trainRepository.findById(id);

    if (!train) {
      throw new NotFoundError("Train not found");
    }

    return train;
  },

  async update(
    id: string,
    data: UpdateTrainInput
  ) {
    const train = await trainRepository.findById(id);

    if (!train) {
      throw new NotFoundError("Train not found");
    }

    if (
      data.trainNumber &&
      data.trainNumber !== train.trainNumber
    ) {
      const existingTrain =
        await trainRepository.findByTrainNumber(
          data.trainNumber
        );

      if (existingTrain) {
        throw new ConflictError(
          "Train number already exists"
        );
      }
    }

    return trainRepository.update(id, data);
  },

  async delete(id: string) {
    const train = await trainRepository.findById(id);

    if (!train) {
      throw new NotFoundError("Train not found");
    }

    await trainRepository.delete(id);
  },
};