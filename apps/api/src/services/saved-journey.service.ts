import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";
import { ConflictError } from "../errors/ConflictError";

import { SavedJourneyDto } from "../dto/saved-journey";
import { savedJourneyRepository } from "../repositories/saved-journey.repository";
import { savedJourneyMapper } from "../mapper/saved-journey.mapper.js";

import {
  CreateSavedJourneyInput,
  UpdateSavedJourneyInput,
} from "../validators/saved-journey.validator";

export const savedJourneyService = {
  async create(
    userId: string,
    data: CreateSavedJourneyInput,
  ): Promise<SavedJourneyDto> {
    const existing = await savedJourneyRepository.findByRoute(
      userId,
      data.fromStationEva,
      data.toStationEva,
    );

    if (existing) {
      throw new ConflictError("This journey is already saved.");
    }

    const journey = await savedJourneyRepository.create(userId, data);

    return savedJourneyMapper.toDto(journey);
  },

  async findAll(userId: string): Promise<SavedJourneyDto[]> {
    const journeys = await savedJourneyRepository.findByUserId(userId);

    return savedJourneyMapper.toDtoList(journeys);
  },

  async update(
    userId: string,
    id: string,
    data: UpdateSavedJourneyInput,
  ): Promise<SavedJourneyDto> {
    const journey = await savedJourneyRepository.findById(id);

    if (!journey) {
      throw new NotFoundError("Saved journey not found.");
    }

    if (journey.userId !== userId) {
      throw new ForbiddenError(
        "You cannot update another user's saved journey.",
      );
    }

    const updated = await savedJourneyRepository.update(id, data);

    return savedJourneyMapper.toDto(updated);
  },

  async delete(userId: string, id: string): Promise<void> {
    const journey = await savedJourneyRepository.findById(id);

    if (!journey) {
      throw new NotFoundError("Saved journey not found.");
    }

    if (journey.userId !== userId) {
      throw new ForbiddenError(
        "You cannot delete another user's saved journey.",
      );
    }

    await savedJourneyRepository.delete(id);
  },
};
