import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { UserRole } from "../generated/prisma/enums";

import { operationsController } from "./operations.controller";

const router = Router();

router.use(authenticate);

router.use(
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.STATION_MANAGER,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
);

router.get("/", operationsController.getOverview);

router.get("/system", operationsController.getSystemStatus);

router.get("/scheduler", operationsController.getSchedulerStatus);

router.get("/websocket", operationsController.getWebSocketStatus);

router.get("/websocket/subscriptions", operationsController.getWebSocketSubscriptions);

router.get("/websocket/events", operationsController.getWebSocketEventStatus);

router.get("/trains", operationsController.getLiveTrains);

router.get("/trains/:trainNumber", operationsController.getLiveTrainByNumber);

router.get("/alerts", operationsController.getAlerts);

router.get("/alerts/statistics", operationsController.getAlertStatistics);

router.get("/alerts/:id", operationsController.getAlertById);

export default router;
