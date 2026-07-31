import { Router } from "express";

import { liveController } from "./live.controller";

const router = Router();

router.get(
  "/stations/search",
  liveController.searchStations.bind(liveController),
);

router.get(
  "/timetable/:evaNo/:date/:hour",
  liveController.getPlannedTimetable.bind(liveController),
);

router.get(
  "/changes/full/:evaNo",
  liveController.getFullChanges.bind(liveController),
);

router.get(
  "/changes/recent/:evaNo",
  liveController.getRecentChanges.bind(liveController),
);

export default router;