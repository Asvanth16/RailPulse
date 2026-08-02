import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { recentSearchController } from "../controllers/recent-search.controller";

const router = Router();

router.use(authenticate);

router.post("/", recentSearchController.create);

router.get("/", recentSearchController.findAll);

router.delete("/:id", recentSearchController.delete);

router.delete("/", recentSearchController.clear);

export default router;
