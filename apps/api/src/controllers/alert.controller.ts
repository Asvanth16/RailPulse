import { Response } from "express";

import { AuthRequest } from "../middleware/auth.middleware";
import { BadRequestError } from "../errors/BadRequestError";

import { alertService } from "../services/alert.service";

import {
  createAlertSchema,
  updateAlertSchema,
} from "../validators/alert.validator";

export const alertController = {
  async create(req: AuthRequest, res: Response) {
    const parsed = createAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.message);
    }

    const alert = await alertService.create(
      req.user!.userId,
      parsed.data,
    );

    res.status(201).json(alert);
  },

  async findAll(req: AuthRequest, res: Response) {
    const alerts = await alertService.findAll(
      req.user!.userId,
    );

    res.json(alerts);
  },

  async findById(req: AuthRequest, res: Response) {
    const alert = await alertService.findById(
      req.user!.userId,
      req.params.id,
    );

    res.json(alert);
  },

  async update(req: AuthRequest, res: Response) {
    const parsed = updateAlertSchema.safeParse(req.body);

    if (!parsed.success) {
      throw new BadRequestError(parsed.error.message);
    }

    const alert = await alertService.update(
      req.user!.userId,
      req.params.id,
      parsed.data,
    );

    res.json(alert);
  },

  async delete(req: AuthRequest, res: Response) {
    await alertService.delete(
      req.user!.userId,
      req.params.id,
    );

    res.status(204).send();
  },
};