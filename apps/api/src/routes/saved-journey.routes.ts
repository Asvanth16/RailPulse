import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { savedJourneyController } from "../controllers/saved-journey.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  savedJourneyController.create,
);

router.get(
  "/",
  authenticate,
  savedJourneyController.findAll,
);

router.put(
  "/:id",
  authenticate,
  savedJourneyController.update,
);

router.delete(
  "/:id",
  authenticate,
  savedJourneyController.delete,
);

export default router;