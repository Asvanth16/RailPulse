import { Response, NextFunction } from "express";

import { AuthRequest } from "../middleware/auth.middleware";

import { BadRequestError } from "../errors/BadRequestError";

import { savedJourneyService } from "../services/saved-journey.service";

import {
  createSavedJourneySchema,
  updateSavedJourneySchema,
} from "../validators/saved-journey.validator";

export const savedJourneyController = {
  async create(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = createSavedJourneySchema.parse(req.body);

      const journey = await savedJourneyService.create(
        req.user!.userId,
        data,
      );

      res.status(201).json({
        success: true,
        data: journey,
      });
    } catch (error) {
      next(error);
    }
  },

  async findAll(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const journeys = await savedJourneyService.findAll(
        req.user!.userId,
      );

      res.status(200).json({
        success: true,
        data: journeys,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Journey id is required.");
      }

      const data = updateSavedJourneySchema.parse(req.body);

      const journey = await savedJourneyService.update(
        req.user!.userId,
        id,
        data,
      );

      res.status(200).json({
        success: true,
        data: journey,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { id } = req.params;

      if (!id) {
        throw new BadRequestError("Journey id is required.");
      }

      await savedJourneyService.delete(
        req.user!.userId,
        id,
      );

      res.status(200).json({
        success: true,
        message: "Saved journey deleted successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};