import { env } from "../config/env";
import { LiveStopDto } from "../dto/live";
import { scheduler } from "../realtime/scheduler/scheduler";
import { alertRepository } from "../repositories/alert.repository";
import { liveTrainStateStore } from "../realtime/state/live-train-state.store";
import { OperationsLiveTrainsResponse } from "./operations-live-train.types";
import { OperationsAlertDto } from "./operations-alert.types";
import { webSocketManager } from "../realtime/websocket/websocket.manager";

export const operationsService = {
  getOverview() {
    return {
      service: "RailPulse Operations API",
    };
  },

  getSchedulerStatus() {
    return scheduler.getStatus();
  },

  getSystemStatus() {
    return {
      service: "RailPulse API",
      status: "OPERATIONAL",
      environment: env.NODE_ENV,
      nodeVersion: process.version,
      uptimeSeconds: Math.floor(process.uptime()),
      generatedAt: new Date().toISOString(),
    };
  },

  async getAlerts(): Promise<OperationsAlertDto[]> {
    const alerts = await alertRepository.findAllForOperations();

    return alerts.map((alert) => ({
      id: alert.id,
      alertType: alert.alertType,
      trainNumber: alert.trainNumber,
      monitorStationEva: alert.monitorStationEva,
      monitorStationName: alert.monitorStationName,
      isEnabled: alert.isEnabled,
      isTriggered: alert.isTriggered,
      lastCheckedAt: alert.lastCheckedAt?.toISOString() ?? null,
      lastTriggeredAt: alert.lastTriggeredAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    }));
  },

  async getAlertStatistics() {
    return alertRepository.getOperationsStatistics();
  },

  async getAlertById(id: string): Promise<OperationsAlertDto | null> {
    const alert = await alertRepository.findById(id);

    if (!alert) {
      return null;
    }

    return {
      id: alert.id,
      alertType: alert.alertType,
      trainNumber: alert.trainNumber,
      monitorStationEva: alert.monitorStationEva,
      monitorStationName: alert.monitorStationName,
      isEnabled: alert.isEnabled,
      isTriggered: alert.isTriggered,
      lastCheckedAt: alert.lastCheckedAt?.toISOString() ?? null,
      lastTriggeredAt: alert.lastTriggeredAt?.toISOString() ?? null,
      createdAt: alert.createdAt.toISOString(),
      updatedAt: alert.updatedAt.toISOString(),
    };
  },

  async getLiveTrains(
    stationEva?: number,
  ): Promise<OperationsLiveTrainsResponse> {
    if (stationEva !== undefined) {
      const trains = await liveTrainStateStore.getStationTrains(stationEva);

      const filteredTrains = trains.filter(
        (train) =>
          train.train.trainNumber !== "Unknown" &&
          train.train.trainNumber !== "UNKNOWN",
      );

      return {
        stationEva,
        count: filteredTrains.length,
        trains: filteredTrains,
      };
    }

    const stations = await alertRepository.findEnabledMonitorStations();

    const allTrains = [];

    for (const eva of stations) {
      const trains = await liveTrainStateStore.getStationTrains(eva);

      for (const train of trains) {
        if (
          train.train.trainNumber === "Unknown" ||
          train.train.trainNumber === "UNKNOWN"
        ) {
          continue;
        }

        allTrains.push(train);
      }
    }

    return {
      stationEva: null,
      count: allTrains.length,
      trains: allTrains,
    };
  },

  async getLiveTrainByNumber(trainNumber: string): Promise<LiveStopDto | null> {
    return liveTrainStateStore.get(trainNumber);
  },

  getWebSocketStatus() {
    const status = webSocketManager.getStatus();

    return {
      status: status.initialized ? "OPERATIONAL" : "UNAVAILABLE",

      initialized: status.initialized,

      connectedClients: status.connectedClients,
    };
  },

  getWebSocketSubscriptions() {
    const subscriptions = webSocketManager.getSubscriptionStatus();

    return {
      trainSubscriptions: subscriptions.trainSubscriptions,

      userSubscriptions: subscriptions.userSubscriptions,

      totalTrainSubscriptions: subscriptions.trainSubscriptions.length,

      totalUserSubscriptions: subscriptions.userSubscriptions.length,
    };
  },

  getWebSocketEventStatus() {
    return webSocketManager.getEventStatus();
  },
};
