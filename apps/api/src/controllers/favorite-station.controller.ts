import { Response, NextFunction } from "express";

import { favoriteStationService } from "../services/favorite-station.service";
import { createFavoriteStationSchema } from "../validators/favorite-station.validator";
import { BadRequestError } from "../errors/BadRequestError";
import { AuthRequest } from "../middleware/auth.middleware";

export const favoriteStationController = {
  async addFavorite(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const data = createFavoriteStationSchema.parse(req.body);

      const favorite =
        await favoriteStationService.addFavorite(
          req.user!.userId,
          data,
        );

      res.status(201).json({
        success: true,
        data: favorite,
      });
    } catch (error) {
      next(error);
    }
  },

  async getFavorites(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const favorites =
        await favoriteStationService.getFavorites(
          req.user!.userId,
        );

      res.status(200).json({
        success: true,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  },

  async removeFavorite(
    req: AuthRequest,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const stationEva = Number(req.params.stationEva);

      if (Number.isNaN(stationEva)) {
        throw new BadRequestError("Invalid station EVA number.");
      }

      await favoriteStationService.removeFavorite(
        req.user!.userId,
        stationEva,
      );

      res.status(200).json({
        success: true,
        message: "Favorite station removed successfully.",
      });
    } catch (error) {
      next(error);
    }
  },
};