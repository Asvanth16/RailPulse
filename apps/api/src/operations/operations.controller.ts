import { Request, Response } from "express";

import { operationsService } from "./operations.service";

export const operationsController = {
  getOverview(_req: Request, res: Response): void {
    const data = operationsService.getOverview();

    res.status(200).json({
      success: true,
      message: "RailPulse Operations API",
      data,
    });
  },

  getSchedulerStatus(_req: Request, res: Response): void {
    const data = operationsService.getSchedulerStatus();

    res.status(200).json({
      success: true,
      message: "Scheduler status retrieved successfully",
      data,
    });
  },

  getSystemStatus(_req: Request, res: Response): void {
    const data = operationsService.getSystemStatus();

    res.status(200).json({
      success: true,
      message: "System status retrieved successfully",
      data,
    });
  },

  async getAlerts(_req: Request, res: Response): Promise<void> {
    const data = await operationsService.getAlerts();

    res.status(200).json({
      success: true,
      message: "Operations alerts retrieved successfully",
      data,
    });
  },

  async getAlertStatistics(_req: Request, res: Response): Promise<void> {
    const data = await operationsService.getAlertStatistics();

    res.status(200).json({
      success: true,
      message: "Alert statistics retrieved successfully",
      data,
    });
  },

  async getAlertById(req: Request, res: Response): Promise<void> {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Alert ID is required",
      });

      return;
    }

    const data = await operationsService.getAlertById(id);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Alert not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Alert details retrieved successfully",
      data,
    });
  },

  async getLiveTrains(req: Request, res: Response): Promise<void> {
    const stationEvaParam = req.query.stationEva;

    let stationEva: number | undefined;

    if (stationEvaParam !== undefined) {
      const value = Array.isArray(stationEvaParam)
        ? stationEvaParam[0]
        : stationEvaParam;

      const parsed = Number(value);

      if (!Number.isInteger(parsed)) {
        res.status(400).json({
          success: false,
          message: "stationEva must be a valid integer",
        });

        return;
      }

      stationEva = parsed;
    }

    const data = await operationsService.getLiveTrains(stationEva);

    res.status(200).json({
      success: true,
      message: "Live trains retrieved successfully",
      data,
    });
  },

  async getLiveTrainByNumber(req: Request, res: Response): Promise<void> {
    const trainNumber = Array.isArray(req.params.trainNumber)
      ? req.params.trainNumber[0]
      : req.params.trainNumber;

    if (!trainNumber) {
      res.status(400).json({
        success: false,
        message: "Train number is required",
      });

      return;
    }

    const data = await operationsService.getLiveTrainByNumber(trainNumber);

    if (!data) {
      res.status(404).json({
        success: false,
        message: "Live train not found",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Live train retrieved successfully",
      data,
    });
  },

  getWebSocketStatus(_req: Request, res: Response): void {
    const data = operationsService.getWebSocketStatus();

    res.status(200).json({
      success: true,
      message: "WebSocket status retrieved successfully",
      data,
    });
  },

  getWebSocketSubscriptions(_req: Request, res: Response): void {
    const data = operationsService.getWebSocketSubscriptions();

    res.status(200).json({
      success: true,
      message: "WebSocket subscriptions retrieved successfully",
      data,
    });
  },

  getWebSocketEventStatus(_req: Request, res: Response): void {
    const data = operationsService.getWebSocketEventStatus();

    res.status(200).json({
      success: true,
      message: "WebSocket event status retrieved successfully",
      data,
    });
  },
};
