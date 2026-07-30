import { Request, Response, NextFunction } from "express";
import { trainRunService } from "../services/train-run.service";

export const trainRunController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const trainRun = await trainRunService.create(req.body);

      res.status(201).json({
        success: true,
        data: trainRun,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const trainRuns = await trainRunService.getAll();

      res.status(200).json({
        success: true,
        data: trainRuns,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const trainRun = await trainRunService.getById(req.params.id);

      res.status(200).json({
        success: true,
        data: trainRun,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const trainRun = await trainRunService.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: trainRun,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await trainRunService.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Train run deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};