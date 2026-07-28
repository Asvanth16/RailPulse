import { Router } from "express";
import { journeyController } from "../controllers/journey.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/authorize.middleware";
import { validate } from "../middleware/validate.middleware";
import { createJourneySchema } from "../validators/journey.validator";
import { UserRole } from "../generated/prisma/enums";

const router = Router();

router.get("/", authenticate, journeyController.getAll);

router.get("/:id", authenticate, journeyController.getById);

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.TRAIN_OPERATOR,
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  validate(createJourneySchema),
  journeyController.create,
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
  ),
  journeyController.delete,
);

export default router;