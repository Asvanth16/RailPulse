import { Request, Response, NextFunction } from "express";
import { trainService } from "../services/train.service";

export const trainController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const train = await trainService.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Train created successfully",
        data: train,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const trains = await trainService.getAll();

      return res.status(200).json({
        success: true,
        data: trains,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const train = await trainService.getById(req.params.id);

      return res.status(200).json({
        success: true,
        data: train,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const train = await trainService.update(
        req.params.id,
        req.body
      );

      return res.status(200).json({
        success: true,
        message: "Train updated successfully",
        data: train,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await trainService.delete(req.params.id);

      return res.status(200).json({
        success: true,
        message: "Train deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },
};