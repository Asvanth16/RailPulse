import { useEffect, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  SystemStatus,
  SchedulerStatus,
  WebSocketStatus,
  LiveTrainsResponse,
} from "../types/operations.types";

import AlertMonitor from "../components/AlertMonitor";
import LiveTrainMonitor from "../components/LiveTrainMonitor";
import WebSocketMonitor from "../components/WebSocketMonitor";

function OperationsDashboard() {
  const [system, setSystem] = useState<SystemStatus | null>(null);

  const [scheduler, setScheduler] = useState<SchedulerStatus | null>(null);

  const [webSocket, setWebSocket] = useState<WebSocketStatus | null>(null);

  const [liveTrains, setLiveTrains] = useState<LiveTrainsResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [trainToSubscribe, setTrainToSubscribe] = useState("2841");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        setError(null);

        const [
          systemResponse,
          schedulerResponse,
          webSocketResponse,
          trainsResponse,
        ] = await Promise.all([
          operationsApi.getSystemStatus(),
          operationsApi.getSchedulerStatus(),
          operationsApi.getWebSocketStatus(),
          operationsApi.getLiveTrains(),
        ]);

        setSystem(systemResponse.data);
        setScheduler(schedulerResponse.data);
        setWebSocket(webSocketResponse.data);
        setLiveTrains(trainsResponse.data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load operations dashboard",
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <h1>RailPulse Operations</h1>
        <p>Loading operational data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <h1>RailPulse Operations</h1>

        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">RAILPULSE OPERATIONS</p>

          <h1>Operations Dashboard</h1>

          <p>Monitor railway operations, realtime services and live trains.</p>
        </div>
      </header>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <h2>System</h2>

          <p>
            Status: <strong>{system?.status ?? "UNKNOWN"}</strong>
          </p>

          <p>Environment: {system?.environment ?? "-"}</p>

          <p>Node: {system?.nodeVersion ?? "-"}</p>
        </div>

        <div className="dashboard-card">
          <h2>Scheduler</h2>

          <p>
            Status:{" "}
            <strong>{scheduler?.isRunning ? "RUNNING" : "STOPPED"}</strong>
          </p>

          <p>Jobs: {scheduler?.jobs.length ?? 0}</p>

          <p>
            Polling: {scheduler ? `${scheduler.pollingIntervalMs} ms` : "-"}
          </p>
        </div>

        <div className="dashboard-card">
          <h2>WebSocket</h2>

          <p>
            Status: <strong>{webSocket?.status ?? "UNKNOWN"}</strong>
          </p>

          <p>Connected clients: {webSocket?.connectedClients ?? 0}</p>
        </div>

        <div className="dashboard-card">
          <h2>Live Trains</h2>

          <p className="large-number">{liveTrains?.count ?? 0}</p>

          <p>Currently monitored</p>
        </div>
      </section>

      <AlertMonitor />
      <LiveTrainMonitor />
      <WebSocketMonitor />
    </div>
  );
}

export default OperationsDashboard;
