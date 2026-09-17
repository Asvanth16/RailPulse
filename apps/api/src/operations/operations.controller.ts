import { Request, Response } from "express";

import { operationsService } from "./operations.service";

export const operationsController = {
  // =========================
  // Overview
  // =========================

  getOverview(_req: Request, res: Response): void {
    const data = operationsService.getOverview();

    res.status(200).json({
      success: true,
      message: "RailPulse Operations API",
      data,
    });
  },

  // =========================
  // System
  // =========================

  getSystemStatus(_req: Request, res: Response): void {
    const data = operationsService.getSystemStatus();

    res.status(200).json({
      success: true,
      message: "System status retrieved successfully",
      data,
    });
  },

  // =========================
  // Scheduler
  // =========================

  getSchedulerStatus(_req: Request, res: Response): void {
    const data = operationsService.getSchedulerStatus();

    res.status(200).json({
      success: true,
      message: "Scheduler status retrieved successfully",
      data,
    });
  },

  // =========================
  // Station Search
  // =========================

  async searchStations(req: Request, res: Response): Promise<void> {
    const searchParam = req.query.search;

    let search: string | undefined;

    if (typeof searchParam === "string") {
      search = searchParam;
    } else if (
      Array.isArray(searchParam) &&
      typeof searchParam[0] === "string"
    ) {
      search = searchParam[0];
    }

    if (!search || !search.trim()) {
      res.status(400).json({
        success: false,
        message: "Station search is required",
      });

      return;
    }

    const data = await operationsService.searchStations(search.trim());

    res.status(200).json({
      success: true,
      message: "Stations retrieved successfully",
      data,
    });
  },

  // =========================
  // Monitored Stations
  // =========================

  async getMonitoredStations(_req: Request, res: Response): Promise<void> {
    const data = await operationsService.getMonitoredStations();

    res.status(200).json({
      success: true,
      message: "Monitored stations retrieved successfully",
      data,
    });
  },

  async addMonitoredStation(req: Request, res: Response): Promise<void> {
    const { eva } = req.body;

    if (typeof eva !== "number" || !Number.isInteger(eva) || eva <= 0) {
      res.status(400).json({
        success: false,
        message: "eva must be a valid positive integer",
      });

      return;
    }

    try {
      const data = await operationsService.addMonitoredStation(eva);

      res.status(201).json({
        success: true,
        message: "Station added to Operations monitoring",
        data,
      });
    } catch (error) {
      res.status(409).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Station could not be added",
      });
    }
  },

  async updateMonitoredStation(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Monitored station id is required",
      });

      return;
    }

    const { ds100, name, isEnabled } = req.body;

    if (ds100 !== undefined && (typeof ds100 !== "string" || !ds100.trim())) {
      res.status(400).json({
        success: false,
        message: "ds100 must be a non-empty string",
      });

      return;
    }

    if (name !== undefined && (typeof name !== "string" || !name.trim())) {
      res.status(400).json({
        success: false,
        message: "name must be a non-empty string",
      });

      return;
    }

    if (isEnabled !== undefined && typeof isEnabled !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isEnabled must be a boolean",
      });

      return;
    }

    try {
      const data = await operationsService.updateMonitoredStation(id, {
        ds100: typeof ds100 === "string" ? ds100.trim() : undefined,

        name: typeof name === "string" ? name.trim() : undefined,

        isEnabled,
      });

      res.status(200).json({
        success: true,
        message: "Monitored station updated successfully",
        data,
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Monitored station not found",
      });
    }
  },

  async removeMonitoredStation(req: Request, res: Response): Promise<void> {
    const id = req.params.id;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Monitored station id is required",
      });

      return;
    }

    try {
      await operationsService.removeMonitoredStation(id);

      res.status(200).json({
        success: true,
        message: "Station removed from Operations monitoring",
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Monitored station not found",
      });
    }
  },

  // =========================
  // Live Trains
  // =========================

  async getLiveTrains(req: Request, res: Response): Promise<void> {
    const stationEvaParam = req.query.stationEva;

    if (stationEvaParam === undefined) {
      res.status(400).json({
        success: false,
        message: "stationEva is required",
      });

      return;
    }

    let stationEvaValue: string | undefined;

    if (typeof stationEvaParam === "string") {
      stationEvaValue = stationEvaParam;
    } else if (
      Array.isArray(stationEvaParam) &&
      typeof stationEvaParam[0] === "string"
    ) {
      stationEvaValue = stationEvaParam[0];
    }

    if (!stationEvaValue || !stationEvaValue.trim()) {
      res.status(400).json({
        success: false,
        message: "stationEva must be provided",
      });

      return;
    }

    const stationEva = Number(stationEvaValue);

    if (!Number.isInteger(stationEva)) {
      res.status(400).json({
        success: false,
        message: "stationEva must be a valid integer",
      });

      return;
    }

    const data = await operationsService.getLiveTrains(stationEva);

    res.status(200).json({
      success: true,
      message: "Live trains retrieved successfully",
      data,
    });
  },

  // =========================
  // Live Train Details
  // =========================

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

    const stationEvaParam = req.query.stationEva;

    let stationEva: number | undefined;

    if (stationEvaParam !== undefined) {
      const value = Array.isArray(stationEvaParam)
        ? stationEvaParam[0]
        : stationEvaParam;

      const parsed = Number(value);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        res.status(400).json({
          success: false,
          message: "stationEva must be a valid positive integer",
        });

        return;
      }

      stationEva = parsed;
    }

    const data = await operationsService.getLiveTrainByNumber(
      trainNumber,
      stationEva,
    );

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

  // =========================
  // WebSocket
  // =========================

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

  // =========================
  // Operational History
  // =========================

  async getRecentOperationalHistory(
    _req: Request,
    res: Response,
  ): Promise<void> {
    const data = await operationsService.getRecentOperationalHistory();

    res.status(200).json({
      success: true,
      message: "Recent operational history retrieved successfully",
      data,
    });
  },

  async getTrainOperationalHistory(req: Request, res: Response): Promise<void> {
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

    const stationEvaParam = req.query.stationEva;

    let stationEva: number | undefined;

    if (stationEvaParam !== undefined) {
      const value = Array.isArray(stationEvaParam)
        ? stationEvaParam[0]
        : stationEvaParam;

      const parsed = Number(value);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        res.status(400).json({
          success: false,
          message: "stationEva must be a valid positive integer",
        });

        return;
      }

      stationEva = parsed;
    }

    const data =
      await operationsService.getTrainOperationalHistory(
        trainNumber,
        stationEva,
      );

    res.status(200).json({
      success: true,
      message: "Train operational history retrieved successfully",
      data,
    });
  },
};
