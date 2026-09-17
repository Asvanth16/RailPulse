import type {
  ApiResponse,
  OperationsOverview,
  SystemStatus,
  SchedulerStatus,
  WebSocketStatus,
  WebSocketSubscriptions,
  WebSocketEventStatus,
  OperationsStation,
  OperationsMonitoredStation,
  LiveTrainsResponse,
  LiveTrain,
  OperationalHistoryEntry,
  RecentOperationalHistoryEntry,
} from "../types/operations.types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api";

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem("railpulse_access_token");

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",

      ...(token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {}),

      ...(options?.headers ?? {}),
    },
  });

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("railpulse_access_token");

      localStorage.removeItem("railpulse_user");

      window.dispatchEvent(new Event("railpulse:auth-expired"));
    }

    const message =
      typeof data === "object" &&
      data !== null &&
      "message" in data &&
      typeof data.message === "string"
        ? data.message
        : `Request failed with status ${response.status}`;

    throw new Error(message);
  }

  return data as T;
}

export const operationsApi = {
  /* =========================
     Operations Overview
  ========================= */

  async getOverview(): Promise<ApiResponse<OperationsOverview>> {
    return request<ApiResponse<OperationsOverview>>("/operations/");
  },

  /* =========================
     System
  ========================= */

  async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    return request<ApiResponse<SystemStatus>>("/operations/system");
  },

  /* =========================
     Scheduler
  ========================= */

  async getSchedulerStatus(): Promise<ApiResponse<SchedulerStatus>> {
    return request<ApiResponse<SchedulerStatus>>("/operations/scheduler");
  },

  /* =========================
     WebSocket
  ========================= */

  async getWebSocketStatus(): Promise<ApiResponse<WebSocketStatus>> {
    return request<ApiResponse<WebSocketStatus>>("/operations/websocket");
  },

  async getWebSocketSubscriptions(): Promise<
    ApiResponse<WebSocketSubscriptions>
  > {
    return request<ApiResponse<WebSocketSubscriptions>>(
      "/operations/websocket/subscriptions",
    );
  },

  async getWebSocketEvents(): Promise<ApiResponse<WebSocketEventStatus>> {
    return request<ApiResponse<WebSocketEventStatus>>(
      "/operations/websocket/events",
    );
  },

  /* =========================
     Station Search
  ========================= */

  async searchStations(
    search: string,
  ): Promise<ApiResponse<OperationsStation[]>> {
    const query = encodeURIComponent(search);

    return request<ApiResponse<OperationsStation[]>>(
      `/operations/stations?search=${query}`,
    );
  },

  /* =========================
     Monitored Stations
  ========================= */

  async getMonitoredStations(): Promise<
    ApiResponse<OperationsMonitoredStation[]>
  > {
    return request<ApiResponse<OperationsMonitoredStation[]>>(
      "/operations/monitored-stations",
    );
  },

  async addMonitoredStation(
    eva: number,
  ): Promise<ApiResponse<OperationsMonitoredStation>> {
    return request<ApiResponse<OperationsMonitoredStation>>(
      "/operations/monitored-stations",
      {
        method: "POST",

        body: JSON.stringify({
          eva,
        }),
      },
    );
  },

  async updateMonitoredStation(
    id: string,
    data: {
      isEnabled?: boolean;
    },
  ): Promise<ApiResponse<OperationsMonitoredStation>> {
    return request<ApiResponse<OperationsMonitoredStation>>(
      `/operations/monitored-stations/${encodeURIComponent(id)}`,
      {
        method: "PATCH",

        body: JSON.stringify(data),
      },
    );
  },

  async removeMonitoredStation(id: string): Promise<ApiResponse<null>> {
    return request<ApiResponse<null>>(
      `/operations/monitored-stations/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
      },
    );
  },

  /* =========================
     Live Trains
  ========================= */

  async getLiveTrains(
    stationEva?: number,
  ): Promise<ApiResponse<LiveTrainsResponse>> {
    const query =
      stationEva !== undefined
        ? `?stationEva=${encodeURIComponent(stationEva)}`
        : "";

    return request<ApiResponse<LiveTrainsResponse>>(
      `/operations/trains${query}`,
    );
  },

  async getLiveTrain(
    trainNumber: string | number,
    stationEva?: number,
  ): Promise<ApiResponse<LiveTrain>> {
    const query =
      stationEva !== undefined
        ? `?stationEva=${encodeURIComponent(stationEva)}`
        : "";

    return request<ApiResponse<LiveTrain>>(
      `/operations/trains/${encodeURIComponent(trainNumber)}${query}`,
    );
  },

  /* =========================
     Operational History
  ========================= */

  async getRecentOperationalHistory(): Promise<
    ApiResponse<{
      history: RecentOperationalHistoryEntry[];
    }>
  > {
    return request<ApiResponse<{ history: RecentOperationalHistoryEntry[] }>>(
      "/operations/history",
    );
  },

  async getTrainOperationalHistory(
    trainNumber: string,
    stationEva?: number,
  ): Promise<
    ApiResponse<{
      trainNumber: string;
      history: OperationalHistoryEntry[];
    }>
  > {
    const query =
      stationEva !== undefined
        ? `?stationEva=${encodeURIComponent(stationEva)}`
        : "";

    return request<
      ApiResponse<{
        trainNumber: string;
        history: OperationalHistoryEntry[];
      }>
    >(
      `/operations/trains/${encodeURIComponent(trainNumber)}/history${query}`,
    );
  },
};
