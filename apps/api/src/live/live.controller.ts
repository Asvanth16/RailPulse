import { Request, Response, NextFunction } from "express";

import { liveService } from "./live.service";
import {
  stationSearchSchema,
  plannedTimetableSchema,
  fullChangesSchema,
  recentChangesSchema,
  trainAtStationSchema,
  routesBetweenStationsSchema,
} from "./live.schemas";

export class LiveController {
  async searchStations(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        query: { q },
      } = stationSearchSchema.parse(req);

      const stations = await liveService.searchStations(q);

      res.status(200).json(stations);
    } catch (error) {
      next(error);
    }
  }

  async getPlannedTimetable(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { evaNo, date, hour },
      } = plannedTimetableSchema.parse(req);

      const timetable = await liveService.getPlannedTimetable(
        evaNo,
        date,
        hour,
      );

      res.status(200).json(timetable);
    } catch (error) {
      next(error);
    }
  }

  async getFullChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { evaNo },
      } = fullChangesSchema.parse(req);

      const timetable = await liveService.getFullChanges(evaNo);

      res.status(200).json(timetable);
    } catch (error) {
      next(error);
    }
  }

  async getRecentChanges(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { evaNo },
      } = recentChangesSchema.parse(req);

      const timetable = await liveService.getRecentChanges(evaNo);

      res.status(200).json(timetable);
    } catch (error) {
      next(error);
    }
  }

  async getTrainAtStation(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { evaNo, trainNumber },
      } = trainAtStationSchema.parse(req);

      const train = await liveService.getTrainAtStation(
        Number(evaNo),
        trainNumber,
      );

      if (!train) {
        res.status(404).json({
          success: false,
          message: `Train ${trainNumber} not found at station ${evaNo}`,
        });
        return;
      }

      res.status(200).json(train);
    } catch (error) {
      next(error);
    }
  }

  async getTrainsToDestination(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        params: { evaNo },
        query: { to },
      } = routesBetweenStationsSchema.parse(req);

      const stops = await liveService.getTrainsToDestination(evaNo, to);

      res.status(200).json({
        stationEva: Number(evaNo),
        to,
        count: stops.length,
        stops,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const liveController = new LiveController();
