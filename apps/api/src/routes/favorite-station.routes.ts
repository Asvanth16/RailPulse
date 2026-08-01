import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { favoriteStationController } from "../controllers/favorite-station.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  favoriteStationController.addFavorite,
);

router.get(
  "/",
  authenticate,
  favoriteStationController.getFavorites,
);

router.delete(
  "/:stationEva",
  authenticate,
  favoriteStationController.removeFavorite,
);

export default router;