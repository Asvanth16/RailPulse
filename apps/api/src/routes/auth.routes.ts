import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { registerSchema } from "../validators/auth.validator";

const router = Router();

router.post(
  "/register",
  validate(registerSchema),
  authController.register
);

export default router;