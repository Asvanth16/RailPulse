import { Router } from "express";
import { UserRole } from "../generated/prisma/enums";

import { trainRunController } from "../controllers/train-run.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import {
  createTrainRunSchema,
  updateTrainRunSchema,
} from "../validators/train-run.validator";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  validate(createTrainRunSchema),
  trainRunController.create
);

router.get("/", trainRunController.getAll);

router.get("/:id", trainRunController.getById);

router.put(
  "/:id",
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  validate(updateTrainRunSchema),
  trainRunController.update
);

router.delete(
  "/:id",
  authorize(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN
  ),
  trainRunController.delete
);

export default router;