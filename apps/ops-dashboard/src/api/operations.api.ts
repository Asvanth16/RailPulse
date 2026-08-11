import type {
  ApiResponse,
  OperationsOverview,
  SystemStatus,
  SchedulerStatus,
  WebSocketStatus,
  WebSocketSubscriptions,
  WebSocketEventStatus,
  LiveTrainsResponse,
  LiveTrain,
  OperationsAlert,
  AlertStatistics,
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

  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("railpulse_access_token");

      localStorage.removeItem("railpulse_user");

      window.dispatchEvent(new Event("railpulse:auth-expired"));
    }

    throw new Error(
      data?.message ?? `Request failed with status ${response.status}`,
    );
  }

  return data;
}

export const operationsApi = {
  async getOverview(): Promise<ApiResponse<OperationsOverview>> {
    return request<ApiResponse<OperationsOverview>>("/operations/");
  },

  async getSystemStatus(): Promise<ApiResponse<SystemStatus>> {
    return request<ApiResponse<SystemStatus>>("/operations/system");
  },

  async getSchedulerStatus(): Promise<ApiResponse<SchedulerStatus>> {
    return request<ApiResponse<SchedulerStatus>>("/operations/scheduler");
  },

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

  async getLiveTrains(
    stationEva?: number,
  ): Promise<ApiResponse<LiveTrainsResponse>> {
    const query = stationEva !== undefined ? `?stationEva=${stationEva}` : "";

    return request<ApiResponse<LiveTrainsResponse>>(
      `/operations/trains${query}`,
    );
  },

  async getLiveTrain(
    trainNumber: string | number,
  ): Promise<ApiResponse<LiveTrain>> {
    return request<ApiResponse<LiveTrain>>(`/operations/trains/${trainNumber}`);
  },

  async getAlerts(): Promise<ApiResponse<OperationsAlert[]>> {
    return request<ApiResponse<OperationsAlert[]>>("/operations/alerts");
  },

  async getAlertStatistics(): Promise<ApiResponse<AlertStatistics>> {
    return request<ApiResponse<AlertStatistics>>(
      "/operations/alerts/statistics",
    );
  },

  async getAlert(id: string): Promise<ApiResponse<OperationsAlert>> {
    return request<ApiResponse<OperationsAlert>>(`/operations/alerts/${id}`);
  },
};
