import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { alertController } from "../controllers/alert.controller";

const router = Router();

router.use(authenticate);

router.post("/", alertController.create);

router.get("/", alertController.findAll);

router.get("/:id", alertController.findById);

router.put("/:id", alertController.update);

router.delete("/:id", alertController.delete);

export default router;