import { BadRequestError } from "../errors/BadRequestError";
import { ForbiddenError } from "../errors/ForbiddenError";
import { NotFoundError } from "../errors/NotFoundError";

import { AlertDto } from "../dto/alert";
import { alertMapper } from "../mapper/alert.mapper";
import { alertRepository } from "../repositories/alert.repository";

import {
  CreateAlertInput,
  UpdateAlertInput,
} from "../validators/alert.validator";

export const alertService = {
  async create(userId: string, data: CreateAlertInput): Promise<AlertDto> {
    // Business validation
    switch (data.alertType) {
      case "DELAY":
      case "PLATFORM_CHANGE":
      case "CANCELLATION":
        if (!data.trainNumber || !data.monitorStationEva) {
          throw new BadRequestError(
            "Train number and monitor station are required for this alert type.",
          );
        }
        break;

      case "DEPARTURE_REMINDER":
      case "ARRIVAL_REMINDER":
        if (!data.journeyId && !data.trainNumber) {
          throw new BadRequestError("Journey ID or train number is required.");
        }
        break;
    }

    const duplicate = await alertRepository.findDuplicate(userId, data);

    if (duplicate) {
      throw new BadRequestError("Alert already exists.");
    }

    const alert = await alertRepository.create(userId, data);

    return alertMapper.toDto(alert);
  },

  async findAll(userId: string): Promise<AlertDto[]> {
    const alerts = await alertRepository.findByUserId(userId);

    return alertMapper.toDtoList(alerts);
  },

  async findById(userId: string, id: string): Promise<AlertDto> {
    const alert = await alertRepository.findById(id);

    if (!alert) {
      throw new NotFoundError("Alert not found.");
    }

    if (alert.userId !== userId) {
      throw new ForbiddenError("You cannot access another user's alert.");
    }

    return alertMapper.toDto(alert);
  },

  async update(
    userId: string,
    id: string,
    data: UpdateAlertInput,
  ): Promise<AlertDto> {
    const alert = await alertRepository.findById(id);

    if (!alert) {
      throw new NotFoundError("Alert not found.");
    }

    if (alert.userId !== userId) {
      throw new ForbiddenError("You cannot update another user's alert.");
    }

    const updated = await alertRepository.update(id, data);

    return alertMapper.toDto(updated);
  },

  async delete(userId: string, id: string): Promise<void> {
    const alert = await alertRepository.findById(id);

    if (!alert) {
      throw new NotFoundError("Alert not found.");
    }

    if (alert.userId !== userId) {
      throw new ForbiddenError("You cannot delete another user's alert.");
    }

    await alertRepository.delete(id);
  },
};
