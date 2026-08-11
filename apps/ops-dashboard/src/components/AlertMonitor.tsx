import { useEffect, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  OperationsAlert,
  AlertStatistics,
} from "../types/operations.types";

function AlertMonitor() {
  const [alerts, setAlerts] = useState<
    OperationsAlert[]
  >([]);

  const [statistics, setStatistics] =
    useState<AlertStatistics | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  async function loadAlerts() {
    try {
      setLoading(true);
      setError(null);

      const [
        alertsResponse,
        statisticsResponse,
      ] = await Promise.all([
        operationsApi.getAlerts(),
        operationsApi.getAlertStatistics(),
      ]);

      setAlerts(alertsResponse.data);
      setStatistics(statisticsResponse.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load alerts",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAlerts();
  }, []);

  if (loading) {
    return <p>Loading alerts...</p>;
  }

  if (error) {
    return (
      <div>
        <p>{error}</p>

        <button onClick={loadAlerts}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <section>
      <h2>Alerts</h2>

      {statistics && (
        <div>
          <p>
            Total: {statistics.total}
          </p>

          <p>
            Enabled: {statistics.enabled}
          </p>

          <p>
            Triggered: {statistics.triggered}
          </p>

          <p>
            Disabled: {statistics.disabled}
          </p>

          <h3>By Type</h3>

          <p>
            Delay: {statistics.byType.DELAY}
          </p>

          <p>
            Platform Change:{" "}
            {statistics.byType.PLATFORM_CHANGE}
          </p>

          <p>
            Cancellation:{" "}
            {statistics.byType.CANCELLATION}
          </p>

          <p>
            Departure Reminder:{" "}
            {statistics.byType.DEPARTURE_REMINDER}
          </p>

          <p>
            Arrival Reminder:{" "}
            {statistics.byType.ARRIVAL_REMINDER}
          </p>
        </div>
      )}

      <h3>Active Alerts</h3>

      {alerts.length === 0 ? (
        <p>No alerts found.</p>
      ) : (
        <div>
          {alerts.map((alert) => (
            <div key={alert.id}>
              <p>
                <strong>
                  {alert.alertType}
                </strong>
              </p>

              <p>
                Train:{" "}
                {alert.trainNumber ?? "N/A"}
              </p>

              <p>
                Station:{" "}
                {alert.monitorStationName ??
                  alert.monitorStationEva ??
                  "N/A"}
              </p>

              <p>
                Enabled:{" "}
                {alert.isEnabled
                  ? "Yes"
                  : "No"}
              </p>

              <p>
                Triggered:{" "}
                {alert.isTriggered
                  ? "Yes"
                  : "No"}
              </p>

              <p>
                Last checked:{" "}
                {alert.lastCheckedAt
                  ? new Date(
                      alert.lastCheckedAt,
                    ).toLocaleString()
                  : "Never"}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default AlertMonitor;