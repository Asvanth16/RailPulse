import { Router } from "express";
import { scheduleController } from "../controllers/schedule.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { createScheduleSchema, updateScheduleSchema, } from "../validators/schedule.validator";
import { UserRole } from "../generated/prisma/enums";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  validate(createScheduleSchema),
  scheduleController.create
);

router.get("/", scheduleController.getAll);

router.get("/:id", scheduleController.getById);

router.put(
  "/:id",
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  validate(updateScheduleSchema),
  scheduleController.update
);

router.delete(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  scheduleController.delete
);

export default router;