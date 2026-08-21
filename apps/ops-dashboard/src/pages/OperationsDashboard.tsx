import { useEffect, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  SystemStatus,
  SchedulerStatus,
  WebSocketStatus,
  LiveTrainsResponse,
} from "../types/operations.types";

import AlertMonitor from "../components/AlertMonitor";
import RecentOperationalUpdates from "../components/RecentOperationalUpdates";

import { useOperationalUpdates } from "../hooks/useOperationalUpdates";

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

  const [liveTrains, setLiveTrains] = useState<LiveTrainsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [systemError, setSystemError] = useState<string | null>(null);

  const [schedulerError, setSchedulerError] = useState<string | null>(null);

  const [webSocketError, setWebSocketError] = useState<string | null>(null);

  const [liveTrainsError, setLiveTrainsError] = useState<string | null>(null);

  // =========================
  // Operational Updates
  // =========================

  const { updates, processSnapshot } = useOperationalUpdates();

  // =========================
  // Dashboard refresh
  // =========================

  useEffect(() => {
    async function loadDashboard() {
      setError(null);

      setSystemError(null);
      setSchedulerError(null);
      setWebSocketError(null);
      setLiveTrainsError(null);

      const results = await Promise.allSettled([
        operationsApi.getSystemStatus(),
        operationsApi.getSchedulerStatus(),
        operationsApi.getWebSocketStatus(),
        operationsApi.getLiveTrains(),
      ]);

      const [systemResult, schedulerResult, webSocketResult, liveTrainsResult] =
        results;

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
      // Live Trains
      // =========================

      if (liveTrainsResult.status === "fulfilled") {
        const trainsData = liveTrainsResult.value.data;

        setLiveTrains(trainsData);

        // Compare the new snapshot
        // against the previous one.
        processSnapshot(trainsData.trains);
      } else {
        setLiveTrainsError(
          liveTrainsResult.reason instanceof Error
            ? liveTrainsResult.reason.message
            : "Failed to load live trains",
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

    // Existing dashboard refresh.
    // DO NOT add another interval.
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

          {liveTrainsError ? (
            <p className="error-message">{liveTrainsError}</p>
          ) : liveTrains ? (
            <>
              <p className="large-number">{liveTrains.count}</p>

              <p>Currently monitored</p>

              <button onClick={onNavigateToLiveTrains}>
                View All Live Trains
              </button>
            </>
          ) : (
            <p>Loading live trains...</p>
          )}
        </div>
      </section>

      {/* =========================
          Recent Operational Updates
          ========================= */}

      <RecentOperationalUpdates updates={updates} />

      {/* =========================
          Alerts
          ========================= */}

      <AlertMonitor />
    </div>
  );
}

export default OperationsDashboard;
