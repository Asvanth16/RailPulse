import { Router } from "express";
import { trainController } from "../controllers/train.controller";
import { validate } from "../middleware/validate.middleware";
import { createTrainSchema, updateTrainSchema, } from "../validators/train.validator";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { UserRole } from "../generated/prisma/enums";

const router = Router();

// Public / Authenticated Read Routes
router.get(
  "/",
  authenticate,
  trainController.getAll
);

router.get(
  "/:id",
  authenticate,
  trainController.getById
);

// Management Routes
router.post(
  "/",
  authenticate,
  authorize(UserRole.TRAIN_OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(createTrainSchema),
  trainController.create
);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.TRAIN_OPERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN),
  validate(updateTrainSchema),
  trainController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.ADMIN, UserRole.SUPER_ADMIN),
  trainController.delete
);

export default router;