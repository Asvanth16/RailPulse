import { ScheduleType } from "../generated/prisma/enums";
import { ConflictError } from "../errors/ConflictError";
import { BadRequestError } from "../errors/BadRequestError";
import { scheduleRepository } from "../repositories/schedule.repository";
import {
  CreateScheduleInput,
  UpdateScheduleInput,
} from "../validators/schedule.validator";

export const scheduleService = {
  async create(data: CreateScheduleInput) {
    const journey = await scheduleRepository.findJourneyById(data.journeyId);

    if (!journey) {
      throw new NotFoundError("Journey not found");
    }

    if (!journey.isActive) {
      throw new BadRequestError("Journey is inactive");
    }

    switch (data.scheduleType) {
      case ScheduleType.DAILY:
        data.monday = true;
        data.tuesday = true;
        data.wednesday = true;
        data.thursday = true;
        data.friday = true;
        data.saturday = true;
        data.sunday = true;
        break;

      case ScheduleType.WEEKDAYS:
        data.monday = true;
        data.tuesday = true;
        data.wednesday = true;
        data.thursday = true;
        data.friday = true;
        data.saturday = false;
        data.sunday = false;
        break;

      case ScheduleType.WEEKENDS:
        data.monday = false;
        data.tuesday = false;
        data.wednesday = false;
        data.thursday = false;
        data.friday = false;
        data.saturday = true;
        data.sunday = true;
        break;

      case ScheduleType.CUSTOM:
        break;
    }

    return scheduleRepository.create(data);
  },

  async getAll() {
    return scheduleRepository.findAll();
  },

  async getById(id: string) {
    const schedule = await scheduleRepository.findById(id);

    if (!schedule) {
      throw new NotFoundError("Schedule not found");
    }

    return schedule;
  },

  async update(id: string, data: UpdateScheduleInput) {
    const schedule = await scheduleRepository.findById(id);

    if (!schedule) {
      throw new NotFoundError("Schedule not found");
    }

    return scheduleRepository.update(id, data);
  },

  async delete(id: string) {
    const schedule = await scheduleRepository.findById(id);

    if (!schedule) {
      throw new NotFoundError("Schedule not found");
    }

    return scheduleRepository.delete(id);
  },
};