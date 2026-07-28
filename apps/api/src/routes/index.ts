import { Router } from "express";

import { getHealth } from "../controllers/health.controller";
import authRoutes from "./auth.routes";
import trainRoutes from "./train.routes";
import stationRoutes from "./station.routes";
import journeyRoutes from "./journey.routes";

const router = Router();

router.get("/health", getHealth);

router.use("/auth", authRoutes);

router.use("/trains", trainRoutes);

router.use("/stations", stationRoutes);

router.use("/journeys", journeyRoutes);

export default router;