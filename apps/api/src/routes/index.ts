import { Router } from "express";

import { getHealth } from "../controllers/health.controller";
import authRoutes from "./auth.routes";
import trainRoutes from "./train.routes";

const router = Router();

router.get("/health", getHealth);

router.use("/auth", authRoutes);

router.use("/trains", trainRoutes);

export default router;