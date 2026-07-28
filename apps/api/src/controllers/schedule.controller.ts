import { Request, Response, NextFunction } from "express";
import { scheduleService } from "../services/schedule.service";

export const scheduleController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.create(req.body);

      res.status(201).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const schedules = await scheduleService.getAll();

      res.status(200).json({
        success: true,
        data: schedules,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.getById(req.params.id);

      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const schedule = await scheduleService.update(
        req.params.id,
        req.body
      );

      res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await scheduleService.delete(req.params.id);

      res.status(200).json({
        success: true,
        message: "Schedule deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};