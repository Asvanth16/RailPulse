import { env } from "../config/env";

import { LiveStopDto } from "../dto/live";

import { deutscheBahnProvider } from "../integrations/deutsche-bahn/provider";

import { operationalHistoryRepository } from "../repositories/operational-history.repository";

import {
  operationsMonitoredStationRepository,
  UpdateOperationsMonitoredStationInput,
} from "../repositories/operations-monitored-station.repository";

import { scheduler } from "../realtime/scheduler/scheduler";

import { liveTrainStateStore } from "../realtime/state/live-train-state.store";

import { liveTrainMonitor } from "../realtime/monitor/live-train.monitor";

import { webSocketManager } from "../realtime/websocket/websocket.manager";

import { OperationsLiveTrainsResponse } from "./operations-live-train.types";

import {
  OperationsMonitoredStationDto,
  OperationsStationDto,
} from "./operations-station.types";

import {
  OperationsRecentHistoryResponse,
  OperationsTrainHistoryResponse,
  OperationalHistoryDto,
} from "./operations-history.types";

export const operationsService = {
  async recordInitialLiveState(train: LiveStopDto): Promise<void> {
    const trainNumber = String(train.train.trainNumber);

    const delay = Math.max(
      train.arrivalDelayMinutes ?? 0,
      train.departureDelayMinutes ?? 0,
    );

    if (delay > 0) {
      await operationalHistoryRepository.createInitialIfMissing({
        trainNumber,
        stationEva: train.stationEva,
        type: "DELAY_CHANGED",
        currentValue: String(delay),
        message: `Train ${trainNumber} was first observed with a ${delay}-minute delay at station ${train.stationEva}.`,
      });
    }

    const platform =
      train.actualPlatform ?? train.plannedPlatform ?? null;

    if (platform !== null) {
      await operationalHistoryRepository.createInitialIfMissing({
        trainNumber,
        stationEva: train.stationEva,
        type: "PLATFORM_CHANGED",
        currentValue: String(platform),
        message: `Train ${trainNumber} was first observed at platform ${platform} at station ${train.stationEva}.`,
      });
    }

    if (train.cancelled) {
      await operationalHistoryRepository.createInitialIfMissing({
        trainNumber,
        stationEva: train.stationEva,
        type: "CANCELLATION",
        currentValue: "true",
        message: `Train ${trainNumber} was first observed as cancelled at station ${train.stationEva}.`,
      });
    }
  },

  // =========================
  // Overview
  // =========================

  getOverview() {
    return {
      service: "RailPulse Operations API",
    };
  },

  // =========================
  // Scheduler
  // =========================

  getSchedulerStatus() {
    return scheduler.getStatus();
  },

  // =========================
  // System
  // =========================

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

  // =========================
  // Station Search
  // =========================

  async searchStations(pattern: string): Promise<OperationsStationDto[]> {
    const normalizedPattern = pattern.trim();

    if (!normalizedPattern) {
      return [];
    }

    const stations =
      await deutscheBahnProvider.searchStations(normalizedPattern);

    return stations.map((station) => ({
      eva: station.eva,
      ds100: station.ds100,
      name: station.name,
    }));
  },

  // =========================
  // Monitored Stations
  // =========================

  async getMonitoredStations(): Promise<OperationsMonitoredStationDto[]> {
    const stations = await operationsMonitoredStationRepository.findAll();

    return stations.map((station) => ({
      id: station.id,
      eva: station.eva,
      ds100: station.ds100,
      name: station.name,
      isEnabled: station.isEnabled,
    }));
  },

  async addMonitoredStation(
    eva: number,
  ): Promise<OperationsMonitoredStationDto> {
    /*
     * ========================================
     * Check whether station is already
     * monitored.
     * ========================================
     */
    const existing = await operationsMonitoredStationRepository.findByEva(eva);

    if (existing) {
      throw new Error(`Station with EVA ${eva} is already monitored.`);
    }

    /*
     * ========================================
     * Fetch authoritative station information
     * from Deutsche Bahn.
     *
     * We only receive EVA from the client.
     * Name and DS100 are obtained from DB.
     * ========================================
     */
    const stations = await deutscheBahnProvider.searchStations(String(eva));

    const station = stations.find((item) => item.eva === eva);

    if (!station) {
      throw new Error(`No Deutsche Bahn station found for EVA ${eva}.`);
    }

    /*
     * ========================================
     * Save the selected station.
     * ========================================
     */
    const monitoredStation = await operationsMonitoredStationRepository.create({
      eva: station.eva,
      ds100: station.ds100,
      name: station.name,
    });

    return {
      id: monitoredStation.id,
      eva: monitoredStation.eva,
      ds100: monitoredStation.ds100,
      name: monitoredStation.name,
      isEnabled: monitoredStation.isEnabled,
    };
  },

  async updateMonitoredStation(
    id: string,
    data: UpdateOperationsMonitoredStationInput,
  ): Promise<OperationsMonitoredStationDto> {
    const station = await operationsMonitoredStationRepository.update(id, data);

    return {
      id: station.id,
      eva: station.eva,
      ds100: station.ds100,
      name: station.name,
      isEnabled: station.isEnabled,
    };
  },

  async removeMonitoredStation(id: string): Promise<void> {
    await operationsMonitoredStationRepository.delete(id);
  },

  async getEnabledMonitoredStationEvas(): Promise<number[]> {
    const stations = await operationsMonitoredStationRepository.findEnabled();

    return stations.map((station) => station.eva);
  },

  // =========================
  // Live Trains
  // =========================

  async getLiveTrains(
    stationEva: number,
  ): Promise<OperationsLiveTrainsResponse> {
    /*
     * Live train viewing is station-based.
     *
     * The operator can select ANY valid DB station.
     * Therefore this endpoint must not depend exclusively
     * on the scheduler's background monitored-station list.
     *
     * Fetch the current planned timetable + realtime changes
     * for the requested EVA and merge them.
     */

    const timetable =
      await liveTrainMonitor.getUniqueStationLiveTrains(stationEva);

    const filteredTrains = timetable.stops.filter(
      (train) =>
        train.train.trainNumber !== "Unknown" &&
        train.train.trainNumber !== "UNKNOWN",
    );

    /*
     * Keep the latest station snapshot in Redis as well.
     *
     * This means subsequent Operations requests can also
     * benefit from the cached station state, while the
     * selected station itself is not required to be a
     * scheduler monitoring target.
     */
    await liveTrainStateStore.setStationTrains(stationEva, filteredTrains);

    return {
      stationEva,
      count: filteredTrains.length,
      trains: filteredTrains,
    };
  },

  async getLiveTrainByNumber(
    trainNumber: string,
    stationEva?: number,
  ): Promise<LiveStopDto | null> {
    const normalizedTrainNumber = trainNumber.trim();

    if (!normalizedTrainNumber) {
      return null;
    }

    /*
     * Train details are station-scoped in Operations.
     *
     * The Live Trains page obtains its data from the station
     * snapshot, while the individual train Redis key has a
     * short TTL and is not sufficient as the source of truth
     * for this screen.
     *
     * When the originating station EVA is available, refresh
     * that station's current live snapshot and find the train
     * inside it. This guarantees that a train visible in Live
     * Trains can also be opened in Train Details.
     */
    if (stationEva !== undefined) {
      const stationData = await this.getLiveTrains(stationEva);
      const train =
        stationData.trains.find(
          (train) =>
            String(train.train.trainNumber).trim() === normalizedTrainNumber,
        ) ?? null;

      if (train) {
        await this.recordInitialLiveState(train);
      }

      return train;
    }

    /*
     * Backwards-compatible fallback for callers that do not
     * provide the station EVA.
     */
    const cachedTrain = await liveTrainStateStore.get(normalizedTrainNumber);

    if (cachedTrain) {
      return cachedTrain;
    }

    /*
     * If the individual key has expired, search all currently
     * enabled Operations monitor stations.
     */
    const stationEvas = await this.getEnabledMonitoredStationEvas();

    for (const eva of stationEvas) {
      const stationData = await this.getLiveTrains(eva);

      const train = stationData.trains.find(
        (item) => String(item.train.trainNumber).trim() === normalizedTrainNumber,
      );

      if (train) {
        return train;
      }
    }

    return null;
  },

  // =========================
  // WebSocket
  // =========================

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

      operationsSubscribers: subscriptions.operationsSubscribers,
    };
  },

  getWebSocketEventStatus() {
    return webSocketManager.getEventStatus();
  },

  // =========================
  // Operational History
  // =========================

  async getRecentOperationalHistory(
    limit = 10,
  ): Promise<OperationsRecentHistoryResponse> {
    const history = await operationalHistoryRepository.findRecent(limit);

    return {
      history: history.map((entry) => ({
        id: entry.id,
        trainNumber: entry.trainRun.journey.train.trainNumber,
        trainRunId: entry.trainRunId,
        category: entry.trainRun.journey.train.trainType,
        type: entry.type,
        previousValue: entry.previousValue,
        currentValue: entry.currentValue,
        message: entry.message,
        occurredAt: entry.occurredAt.toISOString(),
        createdAt: entry.createdAt.toISOString(),
        stationEva: entry.stationEva,
      })),
    };
  },

  async getTrainOperationalHistory(
    trainNumber: string,
    stationEva?: number,
  ): Promise<OperationsTrainHistoryResponse> {
    /*
     * A detail page can be opened for any searched DB station, not only a
     * scheduler-monitored one. Prime initial history from that station's
     * cached snapshot before returning the persisted records.
     */
    if (stationEva !== undefined) {
      const stationTrains =
        await liveTrainStateStore.getStationTrains(stationEva);

      const liveTrain = stationTrains.find(
        (train) =>
          String(train.train.trainNumber).trim() === trainNumber.trim(),
      );

      if (liveTrain) {
        await this.recordInitialLiveState(liveTrain);
      }
    }

    const history =
      await operationalHistoryRepository.findByTrainNumber(
        trainNumber,
        stationEva,
      );

    const historyDto: OperationalHistoryDto[] = history.map((entry) => ({
      id: entry.id,
      trainNumber,
      trainRunId: entry.trainRunId,
      type: entry.type,
      previousValue: entry.previousValue,
      currentValue: entry.currentValue,
      message: entry.message,
      occurredAt: entry.occurredAt.toISOString(),
      createdAt: entry.createdAt.toISOString(),
      stationEva: entry.stationEva,
    }));

    return {
      trainNumber,
      history: historyDto,
    };
  },
};
