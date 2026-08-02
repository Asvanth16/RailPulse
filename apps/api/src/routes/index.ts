import { Router } from "express";

import { getHealth } from "../controllers/health.controller";
import authRoutes from "./auth.routes";
import trainRoutes from "./train.routes";
import stationRoutes from "./station.routes";
import journeyRoutes from "./journey.routes";
import scheduleRoutes from "./schedule.routes";
import trainRunRoutes from "./train-run.routes";
import { liveRoutes } from "../live";
import favoriteStationRoutes from "./favorite-station.routes";
import savedJourneyRoutes from "./saved-journey.routes";

const router = Router();

router.get("/health", getHealth);

router.use("/auth", authRoutes);

router.use("/trains", trainRoutes);

router.use("/stations", stationRoutes);

router.use("/journeys", journeyRoutes);

router.use("/schedules", scheduleRoutes);

router.use("/train-runs", trainRunRoutes);

router.use("/live", liveRoutes);

router.use("/favorite-stations", favoriteStationRoutes);

router.use("/saved-journeys", savedJourneyRoutes);

export default router;
