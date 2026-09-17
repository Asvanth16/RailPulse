import { useCallback, useEffect, useRef, useState } from "react";

import { operationsApi } from "../api/operations.api";

import type {
  LiveTrain,
  OperationalHistoryEntry,
  OperationalHistoryType,
} from "../types/operations.types";

import { getTrainOperationalStatus } from "../utils/trainStatus";

import { useOperationsWebSocket } from "../hooks/useOperationsWebSocket";

import type { OperationsWebSocketEvent } from "../websocket/websocket.types";

interface TrainDetailsPageProps {
  trainNumber: string;

  stationEva: number;

  initialTrain: LiveTrain;

  onBack: () => void;
}

function TrainDetailsPage({
  trainNumber,
  stationEva,
  initialTrain,
  onBack,
}: TrainDetailsPageProps) {
  /*
   * The station EVA from the navigation state is authoritative.
   *
   * The initial LiveTrain is used as a fallback in case an older
   * caller does not provide a valid EVA.
   */
  const resolvedStationEva =
    Number.isInteger(stationEva) && stationEva > 0
      ? stationEva
      : initialTrain.stationEva;

  const [train, setTrain] = useState<LiveTrain>({
    ...initialTrain,

    stationEva: resolvedStationEva,
  });

  const [history, setHistory] = useState<OperationalHistoryEntry[]>([]);

  const [loading, setLoading] = useState(false);

  const [historyLoading, setHistoryLoading] = useState(true);

  const [historyError, setHistoryError] = useState<string | null>(null);

  // =========================
  // Realtime
  // =========================

  const [realtimeConnected, setRealtimeConnected] = useState(false);

  const [realtimeUpdatedAt, setRealtimeUpdatedAt] = useState<string | null>(
    null,
  );

  const realtimeUpdatedAtRef = useRef<string | null>(null);

  /*
   * Keep the latest train state in a ref as well as React state.
   *
   * This lets realtime event handling compare the previous actual
   * arrival/departure values without depending on a stale closure.
   */
  const trainRef = useRef<LiveTrain>({
    ...initialTrain,

    stationEva: resolvedStationEva,
  });

  // =========================
  // Load latest train
  // =========================

  const loadTrainDetails = useCallback(async () => {
    try {
      setLoading(true);

      const response = await operationsApi.getLiveTrain(
        trainNumber,
        resolvedStationEva,
      );

      const nextTrain: LiveTrain = {
        ...response.data,

        stationEva: resolvedStationEva,
      };

      trainRef.current = nextTrain;

      setTrain(nextTrain);
    } catch {
      /*
       * Do not discard the initial snapshot.
       *
       * The train was already visible in Live Trains, so the initial
       * snapshot remains valid for display if the REST request fails.
       */
    } finally {
      setLoading(false);
    }
  }, [trainNumber, resolvedStationEva]);

  // =========================
  // Load operational history
  // =========================

  const loadHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);

      setHistoryError(null);

      const response = await operationsApi.getTrainOperationalHistory(
        trainNumber,
        resolvedStationEva,
      );

      setHistory(
        [...response.data.history].sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() -
            new Date(a.occurredAt).getTime(),
        ),
      );
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Failed to load operational history",
      );
    } finally {
      setHistoryLoading(false);
    }
  }, [trainNumber, resolvedStationEva]);

  // =========================
  // Initial load
  // =========================

  useEffect(() => {
    const initialSnapshot: LiveTrain = {
      ...initialTrain,

      stationEva: resolvedStationEva,
    };

    trainRef.current = initialSnapshot;

    setTrain(initialSnapshot);

    realtimeUpdatedAtRef.current = null;

    setRealtimeUpdatedAt(null);

    /*
     * Load the live snapshot before its history. The detail endpoint records
     * an initial observation for an externally sourced train when needed;
     * loading both requests in parallel could let the history request win the
     * race and incorrectly render an empty state for the first 30 seconds.
     */
    void (async () => {
      await loadTrainDetails();
      await loadHistory();
    })();

    /*
     * History is persisted by the backend realtime job. Refresh it
     * periodically so events that occur while this page is open
     * appear even when the page receives no specialized websocket
     * event for that particular history entry.
     */
    const interval = window.setInterval(() => {
      void loadHistory();
    }, 30_000);

    return () => {
      window.clearInterval(interval);
    };
  }, [initialTrain, resolvedStationEva, loadTrainDetails, loadHistory]);

  // =========================
  // Realtime history helper
  // =========================

  const appendRealtimeHistory = useCallback(
    (
      type: OperationalHistoryType,
      previousValue: string | null,
      currentValue: string | null,
      message: string,
      occurredAt: string,
    ) => {
      const historyId = `realtime-${type}-${trainNumber}-${resolvedStationEva}-${occurredAt}`;

      const entry: OperationalHistoryEntry = {
        id: historyId,

        trainNumber: String(trainNumber),

        /*
         * This entry is a temporary realtime representation. The
         * persisted backend history replaces it on the next history
         * refresh.
         */
        trainRunId: "realtime",

        stationEva: resolvedStationEva,

        type,

        previousValue,

        currentValue,

        message,

        occurredAt,

        createdAt: occurredAt,
      };

      setHistory((currentHistory) => {
        if (currentHistory.some((current) => current.id === historyId)) {
          return currentHistory;
        }

        return [entry, ...currentHistory].sort(
          (a, b) =>
            new Date(b.occurredAt).getTime() -
            new Date(a.occurredAt).getTime(),
        );
      });
    },
    [resolvedStationEva, trainNumber],
  );

  // =========================
  // Realtime events
  // =========================

  const handleRealtimeEvent = useCallback(
    (event: OperationsWebSocketEvent) => {
      /*
       * Only accept events for this train.
       */
      if (String(event.data.trainNumber) !== String(trainNumber)) {
        return;
      }

      /*
       * Only accept events for this station.
       */
      if (event.data.stationEva !== resolvedStationEva) {
        return;
      }

      const eventUpdatedAt = event.data.updatedAt;

      const previousUpdatedAt = realtimeUpdatedAtRef.current;

      /*
       * Ignore stale/out-of-order events.
       */
      if (previousUpdatedAt && eventUpdatedAt <= previousUpdatedAt) {
        return;
      }

      realtimeUpdatedAtRef.current = eventUpdatedAt;

      setRealtimeUpdatedAt(eventUpdatedAt);

      const previousTrain = trainRef.current;

      // =========================
      // Full update
      // =========================

      if (event.type === "train:updated") {
        /*
         * The full update is also used to detect actual arrival and
         * actual departure transitions. Those transitions are stored
         * as STATUS_CHANGED operational history entries by the backend.
         */
        if (
          previousTrain.actualArrival !== event.data.actualArrival &&
          event.data.actualArrival
        ) {
          appendRealtimeHistory(
            "STATUS_CHANGED",
            previousTrain.actualArrival ?? null,
            event.data.actualArrival,
            `Train ${trainNumber} arrived at station ${resolvedStationEva}.`,
            eventUpdatedAt,
          );
        }

        if (
          previousTrain.actualDeparture !== event.data.actualDeparture &&
          event.data.actualDeparture
        ) {
          appendRealtimeHistory(
            "STATUS_CHANGED",
            previousTrain.actualDeparture ?? null,
            event.data.actualDeparture,
            `Train ${trainNumber} departed from station ${resolvedStationEva}.`,
            eventUpdatedAt,
          );
        }

        const nextTrain: LiveTrain = {
          ...previousTrain,

          stationEva: resolvedStationEva,

          train: {
            ...previousTrain.train,

            trainNumber: event.data.trainNumber,

            category: event.data.category,
          },

          plannedArrival:
            event.data.plannedArrival ?? previousTrain.plannedArrival,

          actualArrival:
            event.data.actualArrival ?? previousTrain.actualArrival,

          plannedDeparture:
            event.data.plannedDeparture ?? previousTrain.plannedDeparture,

          actualDeparture:
            event.data.actualDeparture ?? previousTrain.actualDeparture,

          plannedPlatform:
            event.data.plannedPlatform ?? previousTrain.plannedPlatform,

          actualPlatform:
            event.data.actualPlatform ?? previousTrain.actualPlatform,

          arrivalDelayMinutes: event.data.arrivalDelayMinutes,

          departureDelayMinutes: event.data.departureDelayMinutes,

          cancelled: event.data.cancelled,
        };

        trainRef.current = nextTrain;

        setTrain(nextTrain);

        return;
      }

      // =========================
      // Delay update
      // =========================

      if (event.type === "train:delay_updated") {
        const previousDelay = Math.max(
          previousTrain.arrivalDelayMinutes ?? 0,
          previousTrain.departureDelayMinutes ?? 0,
        );

        const currentDelay = Math.max(
          event.data.arrivalDelayMinutes ?? 0,
          event.data.departureDelayMinutes ?? 0,
        );

        if (previousDelay !== currentDelay) {
          appendRealtimeHistory(
            "DELAY_CHANGED",
            String(previousDelay),
            String(currentDelay),
            `Train ${trainNumber} delay changed from ${previousDelay} to ${currentDelay} minutes at station ${resolvedStationEva}.`,
            eventUpdatedAt,
          );
        }

        const nextTrain: LiveTrain = {
          ...previousTrain,

          stationEva: resolvedStationEva,

          arrivalDelayMinutes: event.data.arrivalDelayMinutes,

          departureDelayMinutes: event.data.departureDelayMinutes,
        };

        trainRef.current = nextTrain;

        setTrain(nextTrain);

        return;
      }

      // =========================
      // Platform update
      // =========================

      if (event.type === "train:platform_changed") {
        const previousPlatform =
          previousTrain.actualPlatform ?? previousTrain.plannedPlatform ?? null;

        const currentPlatform =
          event.data.actualPlatform ?? event.data.plannedPlatform ?? null;

        if (previousPlatform !== currentPlatform) {
          appendRealtimeHistory(
            "PLATFORM_CHANGED",
            previousPlatform,
            currentPlatform,
            `Train ${trainNumber} platform changed from ${previousPlatform ?? "N/A"} to ${currentPlatform ?? "N/A"} at station ${resolvedStationEva}.`,
            eventUpdatedAt,
          );
        }

        const nextTrain: LiveTrain = {
          ...previousTrain,

          stationEva: resolvedStationEva,

          plannedPlatform:
            event.data.plannedPlatform ?? previousTrain.plannedPlatform,

          actualPlatform:
            event.data.actualPlatform ?? previousTrain.actualPlatform,
        };

        trainRef.current = nextTrain;

        setTrain(nextTrain);

        return;
      }

      // =========================
      // Cancellation
      // =========================

      if (event.type === "train:cancelled") {
        if (previousTrain.cancelled !== event.data.cancelled) {
          appendRealtimeHistory(
            event.data.cancelled ? "CANCELLATION" : "STATUS_CHANGED",
            String(previousTrain.cancelled),
            String(event.data.cancelled),
            event.data.cancelled
              ? `Train ${trainNumber} was cancelled at station ${resolvedStationEva}.`
              : `Train ${trainNumber} is no longer cancelled at station ${resolvedStationEva}.`,
            eventUpdatedAt,
          );
        }

        const nextTrain: LiveTrain = {
          ...previousTrain,

          stationEva: resolvedStationEva,

          cancelled: event.data.cancelled,
        };

        trainRef.current = nextTrain;

        setTrain(nextTrain);
      }
    },
    [
      appendRealtimeHistory,
      resolvedStationEva,
      trainNumber,
    ],
  );

  // =========================
  // Operations WebSocket
  // =========================

  const {
    connected,
    subscribed,
    error: websocketError,
  } = useOperationsWebSocket({
    onEvent: handleRealtimeEvent,
  });

  useEffect(() => {
    setRealtimeConnected(connected && subscribed);
  }, [connected, subscribed]);

  // =========================
  // Status
  // =========================

  const operationalStatus = getTrainOperationalStatus(train);

  // =========================
  // Date formatting
  // =========================

  function formatDateTime(value?: string): string {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleString();
  }

  function formatHistoryValue(value: string | null): string {
    if (value === null || value === "") {
      return "N/A";
    }

    return value;
  }

  function formatMessageType(type: string): string {
    switch (type.toLowerCase()) {
      case "h":
        return "General Information";
      case "q":
        return "Quality Change";
      case "f":
        return "Information";
      case "d":
        return "Cause of Delay";
      case "i":
        return "IBIS Information";
      case "u":
        return "IBIS Information";
      case "r":
        return "Disruption";
      case "c":
        return "Connection Information";
      default:
        return type;
    }
  }

  const visibleMessages = (train.messages ?? []).filter(
    (message) => message.text.trim().length > 0,
  );

  // =========================
  // Render
  // =========================

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">RAILPULSE OPERATIONS</p>

          <h1>
            {train.train.category} {train.train.trainNumber}
          </h1>

          <p>Detailed operational information for this train.</p>

          <button onClick={onBack}>Back to Live Trains</button>
        </div>
      </header>

      {/* =========================
          Realtime
          ========================= */}

      <section className="dashboard-card">
        <h2>Realtime</h2>

        <p>
          Connection:{" "}
          <strong>{realtimeConnected ? "CONNECTED" : "DISCONNECTED"}</strong>
        </p>

        {realtimeUpdatedAt && (
          <p>Last realtime update: {formatDateTime(realtimeUpdatedAt)}</p>
        )}

        {websocketError && <p className="error-message">{websocketError}</p>}
      </section>

      {/* =========================
          Train Information
          ========================= */}

      <section className="dashboard-card">
        <h2>Train Information</h2>

        <p>Train number: {train.train.trainNumber}</p>

        <p>Category: {train.train.category}</p>

        <p>Operator: {train.train.operator}</p>

        <p>
          Station EVA: <strong>{resolvedStationEva}</strong>
        </p>

        {train.origin && <p>Origin: {train.origin}</p>}

        {train.destination && <p>Destination: {train.destination}</p>}
      </section>

      {/* =========================
          Current State
          ========================= */}

      <section className="dashboard-card">
        <h2>Current State</h2>

        <p>
          Operational status: <strong>{operationalStatus}</strong>
        </p>

        <p>Planned arrival: {formatDateTime(train.plannedArrival)}</p>

        <p>Actual arrival: {formatDateTime(train.actualArrival)}</p>

        <p>Planned departure: {formatDateTime(train.plannedDeparture)}</p>

        <p>Actual departure: {formatDateTime(train.actualDeparture)}</p>

        <p>Planned platform: {train.plannedPlatform ?? "N/A"}</p>

        <p>Actual platform: {train.actualPlatform ?? "N/A"}</p>

        <p>Arrival delay: {train.arrivalDelayMinutes ?? 0} minutes</p>

        <p>Departure delay: {train.departureDelayMinutes ?? 0} minutes</p>

        <p>Cancelled: {train.cancelled ? "Yes" : "No"}</p>
      </section>

      {/* =========================
          Messages
          ========================= */}

      <section className="dashboard-card">
        <h2>Messages</h2>

        {visibleMessages.length === 0 ? (
          <p>No meaningful operational messages available.</p>
        ) : (
          <div>
            {visibleMessages.map((message) => (
              <article key={message.id}>
                <h3>{formatMessageType(message.type)}</h3>

                <p>{message.text}</p>

                {message.priority && (
                  <p>
                    Priority: {
                      message.priority === "1"
                        ? "High"
                        : message.priority === "2"
                          ? "Medium"
                          : message.priority === "3"
                            ? "Low"
                            : message.priority === "4"
                              ? "Completed"
                              : message.priority
                    }
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      {/* =========================
          Operational History
          ========================= */}

      <section className="dashboard-card">
        <h2>Operational History</h2>

        {historyLoading ? (
          <p>Loading operational history...</p>
        ) : historyError ? (
          <>
            <p className="error-message">{historyError}</p>

            <button onClick={() => void loadHistory()}>Retry</button>
          </>
        ) : history.length === 0 ? (
          <p>No operational history available yet.</p>
        ) : (
          <div>
            {history.map((entry) => (
              <article key={entry.id}>
                <h3>{entry.type.replaceAll("_", " ")}</h3>

                <p>{entry.message}</p>

                {(entry.previousValue !== null ||
                  entry.currentValue !== null) && (
                  <p>
                    {entry.previousValue !== null && (
                      <>
                        Previous: {formatHistoryValue(entry.previousValue)}
                      </>
                    )}

                    {entry.previousValue !== null &&
                      entry.currentValue !== null && " · "}

                    {entry.currentValue !== null && (
                      <>Current: {formatHistoryValue(entry.currentValue)}</>
                    )}
                  </p>
                )}

                {entry.stationEva !== null && (
                  <p>Station EVA: {entry.stationEva}</p>
                )}

                <p>Occurred: {formatDateTime(entry.occurredAt)}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default TrainDetailsPage;
