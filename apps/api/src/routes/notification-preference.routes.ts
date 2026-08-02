import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";

import { notificationPreferenceController } from "../controllers/notification-preference.controller";

const router = Router();

router.use(authenticate);

router.post("/", notificationPreferenceController.create);

router.get("/", notificationPreferenceController.findByUserId);

router.put("/", notificationPreferenceController.update);

router.delete("/", notificationPreferenceController.delete);

export default router;
