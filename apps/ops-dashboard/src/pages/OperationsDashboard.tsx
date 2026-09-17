import { useEffect, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  OperationalUpdate,
  SystemStatus,
  SchedulerStatus,
  WebSocketStatus,
} from "../types/operations.types";

import RecentOperationalUpdates from "../components/RecentOperationalUpdates";

import { useOperationalUpdates } from "../hooks/useOperationalUpdates";
import { useOperationsWebSocket } from "../hooks/useOperationsWebSocket";

interface OperationsDashboardProps {
  onNavigateToLiveTrains: () => void;
}

function OperationsDashboard({
  onNavigateToLiveTrains,
}: OperationsDashboardProps) {
  const [system, setSystem] = useState<SystemStatus | null>(null);

  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);

  const [webSocket, setWebSocket] = useState<WebSocketStatus | null>(null);

  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [systemError, setSystemError] = useState<string | null>(null);

  const [schedulerError, setSchedulerError] = useState<string | null>(null);

  const [webSocketError, setWebSocketError] = useState<string | null>(null);

  const [persistedUpdates, setPersistedUpdates] = useState<
    OperationalUpdate[]
  >([]);

  // =========================
  // Operational Updates
  // =========================

  const { updates, processRealtimeEvent } = useOperationalUpdates();

  /*
   * The backend already publishes operational changes to the Operations room.
   * Subscribe on this page so the recent-updates panel receives them instead
   * of waiting for a Live Trains snapshot that the dashboard never loads.
   */
  useOperationsWebSocket({
    onEvent: processRealtimeEvent,
  });

  const visibleUpdates = [...updates, ...persistedUpdates]
    .sort(
      (first, second) =>
        new Date(second.detectedAt).getTime() -
        new Date(first.detectedAt).getTime(),
    )
    .slice(0, 10);

  // =========================
  // Dashboard refresh
  // =========================

  useEffect(() => {
    async function loadDashboard() {
      setError(null);

      setSystemError(null);
      setSchedulerError(null);
      setWebSocketError(null);

      const results = await Promise.allSettled([
        operationsApi.getSystemStatus(),
        operationsApi.getSchedulerStatus(),
        operationsApi.getWebSocketStatus(),
        operationsApi.getRecentOperationalHistory(),
      ]);

      const [
        systemResult,
        schedulerResult,
        webSocketResult,
        historyResult,
      ] = results;

      // =========================
      // System
      // =========================

      if (systemResult.status === "fulfilled") {
        setSystem(systemResult.value.data);
      } else {
        setSystemError(
          systemResult.reason instanceof Error
            ? systemResult.reason.message
            : "Failed to load system status",
        );
      }

      // =========================
      // Scheduler
      // =========================

      if (schedulerResult.status === "fulfilled") {
        setScheduler(schedulerResult.value.data);
      } else {
        setSchedulerError(
          schedulerResult.reason instanceof Error
            ? schedulerResult.reason.message
            : "Failed to load scheduler status",
        );
      }

      // =========================
      // WebSocket
      // =========================

      if (webSocketResult.status === "fulfilled") {
        setWebSocket(webSocketResult.value.data);
      } else {
        setWebSocketError(
          webSocketResult.reason instanceof Error
            ? webSocketResult.reason.message
            : "Failed to load WebSocket status",
        );
      }

      // =========================
      // Recent operational history
      // =========================

      if (historyResult.status === "fulfilled") {
        setPersistedUpdates(
          historyResult.value.data.history.map((entry) => ({
            id: entry.id,
            type:
              entry.type === "CANCELLATION"
                ? "CANCELLED"
                : entry.type,
            trainNumber: entry.trainNumber,
            category: entry.category,
            stationEva: entry.stationEva ?? 0,
            previousValue: entry.previousValue,
            currentValue: entry.currentValue,
            message: entry.message,
            detectedAt: entry.occurredAt,
          })),
        );
      }

      // =========================
      // Overall dashboard status
      // =========================

      const allFailed = results.every((result) => result.status === "rejected");

      if (allFailed) {
        setError("Unable to load operations data.");
      } else {
        setLastUpdatedAt(new Date().toISOString());
      }

      setLoading(false);
    }

    // Initial load
    loadDashboard();

    // Refresh dashboard system information.
    const interval = window.setInterval(loadDashboard, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =========================
  // Loading
  // =========================

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>RailPulse Operations</h1>

        <p>Loading operational data...</p>
      </div>
    );
  }

  // =========================
  // Complete failure
  // =========================

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>RailPulse Operations</h1>

        <div className="error-message">{error}</div>
      </div>
    );
  }

  // =========================
  // Dashboard
  // =========================

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">RAILPULSE OPERATIONS</p>

          <h1>Operations Dashboard</h1>

          <p>Monitor railway operations, realtime services and live trains.</p>

          {lastUpdatedAt && (
            <p>
              Last dashboard update:{" "}
              {new Date(lastUpdatedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </header>

      {/* =========================
          System Cards
          ========================= */}

      <section className="dashboard-grid">
        {/* =========================
            System
            ========================= */}

        <div className="dashboard-card">
          <h2>System</h2>

          {systemError ? (
            <p className="error-message">{systemError}</p>
          ) : system ? (
            <>
              <p>
                Status: <strong>{system.status}</strong>
              </p>

              <p>Environment: {system.environment}</p>

              <p>Node: {system.nodeVersion}</p>
            </>
          ) : (
            <p>Loading system status...</p>
          )}
        </div>

        {/* =========================
            Scheduler
            ========================= */}

        <div className="dashboard-card">
          <h2>Scheduler</h2>

          {schedulerError ? (
            <p className="error-message">{schedulerError}</p>
          ) : scheduler ? (
            <>
              <p>
                Status:{" "}
                <strong>{scheduler.isRunning ? "RUNNING" : "STOPPED"}</strong>
              </p>

              <p>Jobs: {scheduler.jobs.length}</p>

              <p>Polling: {scheduler.pollingIntervalMs} ms</p>
            </>
          ) : (
            <p>Loading scheduler status...</p>
          )}
        </div>

        {/* =========================
            WebSocket
            ========================= */}

        <div className="dashboard-card">
          <h2>WebSocket</h2>

          {webSocketError ? (
            <p className="error-message">{webSocketError}</p>
          ) : webSocket ? (
            <>
              <p>
                Status: <strong>{webSocket.status}</strong>
              </p>

              <p>Connected clients: {webSocket.connectedClients}</p>
            </>
          ) : (
            <p>Loading WebSocket status...</p>
          )}
        </div>

        {/* =========================
            Live Trains
            ========================= */}

        <div className="dashboard-card">
          <h2>Live Trains</h2>

          <p>Select a station to monitor live trains.</p>

          <button onClick={onNavigateToLiveTrains}>View Live Trains</button>
        </div>
      </section>

      {/* =========================
          Recent Operational Updates
          ========================= */}

      <RecentOperationalUpdates updates={visibleUpdates} />
    </div>
  );
}

export default OperationsDashboard;
