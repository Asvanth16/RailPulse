import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import { BadRequestError } from "../errors/BadRequestError";

import { notificationPreferenceService } from "../services/notification-preference.service";

import {
  createNotificationPreferenceSchema,
  updateNotificationPreferenceSchema,
} from "../validators/notification-preference.validator";

export const notificationPreferenceController = {
  async create(req: AuthRequest, res: Response) {
    const parsed =
      createNotificationPreferenceSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.message);
    }

    const preference =
      await notificationPreferenceService.create(
        req.user!.userId,
        parsed.data,
      );

    res.status(201).json(preference);
  },

  async findByUserId(
    req: AuthRequest,
    res: Response,
  ) {
    const preference =
      await notificationPreferenceService.findByUserId(
        req.user!.userId,
      );

    res.json(preference);
  },

  async update(req: AuthRequest, res: Response) {
    const parsed =
      updateNotificationPreferenceSchema.safeParse(
        req.body,
      );

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.message);
    }

    const preference =
      await notificationPreferenceService.update(
        req.user!.userId,
        parsed.data,
      );

    res.json(preference);
  },

  async delete(req: AuthRequest, res: Response) {
    await notificationPreferenceService.delete(
      req.user!.userId,
    );

    res.status(204).send();
  },
};