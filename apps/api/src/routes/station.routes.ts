import { Router } from "express";
import { stationController } from "../controllers/station.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createStationSchema,
  updateStationSchema,
} from "../validators/station.validator";
import { UserRole } from "../generated/prisma/enums";

const router = Router();

router.use(authenticate);

router.get("/", stationController.getAll);

router.get("/:id", stationController.getById);

router.post(
  "/",
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  validate(createStationSchema),
  stationController.create
);

router.put(
  "/:id",
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  validate(updateStationSchema),
  stationController.update
);

router.delete(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  stationController.delete
);

export default router;