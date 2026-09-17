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

router.get(
  "/trains/:evaNo/:trainNumber",
  liveController.getTrainAtStation.bind(liveController),
);

router.get(
  "/routes/:evaNo",
  liveController.getTrainsToDestination.bind(liveController),
);

export default router;
