import { Router } from "express";

import { getHealth } from "../controllers/health.controller";
import authRoutes from "./auth.routes";

const router = Router();

router.get("/health", getHealth);

router.use("/auth", authRoutes);

export default router;