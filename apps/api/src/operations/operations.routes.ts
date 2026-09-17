import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { UserRole } from "../generated/prisma/enums";

import { operationsController } from "./operations.controller";

const router = Router();

const STAFF_ROLES = [
  UserRole.TRAIN_OPERATOR,
  UserRole.STATION_MANAGER,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
] as const;

router.use(authenticate);

// ==========================
// Staff-only: system internals
// ==========================

router.get("/", authorize(...STAFF_ROLES), operationsController.getOverview);

router.get(
  "/system",
  authorize(...STAFF_ROLES),
  operationsController.getSystemStatus,
);

router.get(
  "/scheduler",
  authorize(...STAFF_ROLES),
  operationsController.getSchedulerStatus,
);

router.get(
  "/websocket",
  authorize(...STAFF_ROLES),
  operationsController.getWebSocketStatus,
);

router.get(
  "/websocket/subscriptions",
  authorize(...STAFF_ROLES),
  operationsController.getWebSocketSubscriptions,
);

router.get(
  "/websocket/events",
  authorize(...STAFF_ROLES),
  operationsController.getWebSocketEventStatus,
);

router.get(
  "/history",
  authorize(...STAFF_ROLES),
  operationsController.getRecentOperationalHistory,
);

// ==========================
// Any authenticated user (passengers included): read-only live data
// ==========================

router.get("/stations", operationsController.searchStations);

router.get("/trains", operationsController.getLiveTrains);

router.get(
  "/trains/:trainNumber/history",
  operationsController.getTrainOperationalHistory,
);

router.get("/trains/:trainNumber", operationsController.getLiveTrainByNumber);

export default router;
