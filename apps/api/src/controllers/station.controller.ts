import { Request, Response, NextFunction } from "express";
import { stationService } from "../services/station.service";

export const stationController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.createStation(req.body);

      res.status(201).json({
        success: true,
        message: "Station created successfully",
        data: station,
      });
    } catch (error) {
      next(error);
    }
  },

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const stations = await stationService.getAllStations();

      res.status(200).json({
        success: true,
        data: stations,
      });
    } catch (error) {
      next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.getStationById(req.params.id);

      res.status(200).json({
        success: true,
        data: station,
      });
    } catch (error) {
      next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.updateStation(
        req.params.id,
        req.body,
      );

      res.status(200).json({
        success: true,
        message: "Station updated successfully",
        data: station,
      });
    } catch (error) {
      next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const station = await stationService.deleteStation(req.params.id);

      res.status(200).json({
        success: true,
        message: "Station deleted successfully",
        data: station,
      });
    } catch (error) {
      next(error);
    }
  },
};
