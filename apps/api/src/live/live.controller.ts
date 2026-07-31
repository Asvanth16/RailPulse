import { Request, Response, NextFunction } from "express";

import { liveService } from "./live.service";
import {
  stationSearchSchema,
  plannedTimetableSchema,
  fullChangesSchema,
  recentChangesSchema,
} from "./live.schemas";

export class LiveController {
  async searchStations(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
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

  async getPlannedTimetable(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        params: { evaNo, date, hour },
      } = plannedTimetableSchema.parse(req);

      const timetable =
        await liveService.getPlannedTimetable(
          evaNo,
          date,
          hour,
        );

      res.status(200).json(timetable);
    } catch (error) {
      next(error);
    }
  }

  async getFullChanges(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        params: { evaNo },
      } = fullChangesSchema.parse(req);

      const timetable =
        await liveService.getFullChanges(evaNo);

      res.status(200).json(timetable);
    } catch (error) {
      next(error);
    }
  }

  async getRecentChanges(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const {
        params: { evaNo },
      } = recentChangesSchema.parse(req);

      const timetable =
        await liveService.getRecentChanges(evaNo);

      res.status(200).json(timetable);
    } catch (error) {
      next(error);
    }
  }
}

export const liveController = new LiveController();