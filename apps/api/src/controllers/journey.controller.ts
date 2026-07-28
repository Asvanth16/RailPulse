import { Request, Response, NextFunction } from "express";
import { journeyService } from "../services/journey.service";

export const journeyController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const journey = await journeyService.createJourney(req.body);

      res.status(201).json({
        success: true,
        data: journey,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const journeys = await journeyService.getAllJourneys();

      res.status(200).json({
        success: true,
        data: journeys,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const journey = await journeyService.getJourneyById(req.params.id);

      res.status(200).json({
        success: true,
        data: journey,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await journeyService.deleteJourney(req.params.id);

      res.status(200).json({
        success: true,
        message: "Journey deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};