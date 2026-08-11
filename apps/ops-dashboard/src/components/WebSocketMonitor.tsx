import { useEffect, useState } from "react";

import {
  connectWebSocket,
  disconnectWebSocket,
  socket,
} from "../websocket/socket";

import type {
  ConnectionReadyPayload,
  SubscriptionErrorPayload,
  SubscriptionSuccessPayload,
  TrainUpdatedEvent,
  TrainDelayUpdatedEvent,
  TrainPlatformChangedEvent,
  TrainCancelledEvent,
  AlertTriggeredEvent,
} from "../websocket/websocket.types";

function WebSocketMonitor() {
  const [connected, setConnected] = useState(socket.connected);

  const [socketId, setSocketId] = useState<string | null>(null);

  const [lastEvent, setLastEvent] = useState<string | null>(null);

  const [lastTrainUpdate, setLastTrainUpdate] =
    useState<TrainUpdatedEvent | null>(null);

  const [lastDelayUpdate, setLastDelayUpdate] =
    useState<TrainDelayUpdatedEvent | null>(null);

  const [lastPlatformChange, setLastPlatformChange] =
    useState<TrainPlatformChangedEvent | null>(null);

  const [lastCancellation, setLastCancellation] =
    useState<TrainCancelledEvent | null>(null);

  const [lastAlert, setLastAlert] = useState<AlertTriggeredEvent | null>(null);

  const [error, setError] = useState<string | null>(null);

  const [subscribedTrain, setSubscribedTrain] = useState<string | null>(null);

  const [trainToSubscribe, setTrainToSubscribe] = useState("2841");

  useEffect(() => {
    function handleConnect() {
      console.log("🔌 Operations WebSocket connected", socket.id);

      setConnected(true);
      setError(null);
    }

    function handleDisconnect(reason: string) {
      console.log("🔌 Operations WebSocket disconnected:", reason);

      setConnected(false);
    }

    function handleConnectionReady(payload: ConnectionReadyPayload) {
      console.log("✅ WebSocket connection ready:", payload);

      setSocketId(payload.socketId);
      setLastEvent("connection:ready");
    }

    function handleSubscriptionSuccess(payload: SubscriptionSuccessPayload) {
      console.log("📡 Train subscription successful:", payload);

      setSubscribedTrain(payload.trainNumber);
      setLastEvent("subscription:success");
      setError(null);
    }

    function handleSubscriptionError(payload: SubscriptionErrorPayload) {
      console.error("❌ WebSocket subscription error:", payload);

      setError(payload.message);
      setLastEvent("subscription:error");
    }

    function handleTrainUpdated(payload: TrainUpdatedEvent) {
      console.log("🚆 TRAIN UPDATED", payload);

      setLastTrainUpdate(payload);
      setLastEvent("train:updated");
    }

    function handleTrainDelayUpdated(payload: TrainDelayUpdatedEvent) {
      console.log("⏱️ TRAIN DELAY UPDATED", payload);

      setLastDelayUpdate(payload);
      setLastEvent("train:delay_updated");
    }

    function handleTrainPlatformChanged(payload: TrainPlatformChangedEvent) {
      console.log("🚉 TRAIN PLATFORM CHANGED", payload);

      setLastPlatformChange(payload);
      setLastEvent("train:platform_changed");
    }

    function handleTrainCancelled(payload: TrainCancelledEvent) {
      console.log("🚫 TRAIN CANCELLED", payload);

      setLastCancellation(payload);
      setLastEvent("train:cancelled");
    }

    function handleAlertTriggered(payload: AlertTriggeredEvent) {
      console.log("🔔 ALERT TRIGGERED", payload);

      setLastAlert(payload);
      setLastEvent("alert:triggered");
    }

    socket.on("connect", handleConnect);

    socket.on("disconnect", handleDisconnect);

    socket.on("connection:ready", handleConnectionReady);

    socket.on("subscription:success", handleSubscriptionSuccess);

    socket.on("subscription:error", handleSubscriptionError);

    socket.on("train:updated", handleTrainUpdated);

    socket.on("train:delay_updated", handleTrainDelayUpdated);

    socket.on("train:platform_changed", handleTrainPlatformChanged);

    socket.on("train:cancelled", handleTrainCancelled);

    socket.on("alert:triggered", handleAlertTriggered);

    console.log("🔌 Registering WebSocket listeners...");

    connectWebSocket();

    return () => {
      socket.off("connect", handleConnect);

      socket.off("disconnect", handleDisconnect);

      socket.off("connection:ready", handleConnectionReady);

      socket.off("subscription:success", handleSubscriptionSuccess);

      socket.off("subscription:error", handleSubscriptionError);

      socket.off("train:updated", handleTrainUpdated);

      socket.off("train:delay_updated", handleTrainDelayUpdated);

      socket.off("train:platform_changed", handleTrainPlatformChanged);

      socket.off("train:cancelled", handleTrainCancelled);

      socket.off("alert:triggered", handleAlertTriggered);

      disconnectWebSocket();
    };
  }, []);

  function subscribeToTrain(trainNumber: string) {
    const normalizedTrainNumber = trainNumber.trim();

    if (!normalizedTrainNumber) {
      setError("Train number is required.");

      return;
    }

    if (!socket.connected) {
      setError("WebSocket is not connected.");

      return;
    }

    setError(null);

    socket.emit("subscribe:train", {
      trainNumber: normalizedTrainNumber,
    });
  }

  return (
    <section>
      <h2>WebSocket Monitor</h2>

      <p>
        Status: <strong>{connected ? "CONNECTED" : "DISCONNECTED"}</strong>
      </p>

      <p>Socket ID: {socketId ?? "N/A"}</p>

      <p>Last event: {lastEvent ?? "None"}</p>

      {error && <p>WebSocket error: {error}</p>}

      {/* ============================
          Train Subscription
          ============================ */}

      <div>
        <h3>Subscribe to Train</h3>

        <input
          type="text"
          value={trainToSubscribe}
          onChange={(event) => setTrainToSubscribe(event.target.value)}
          placeholder="Enter train number"
        />

        <button onClick={() => subscribeToTrain(trainToSubscribe)}>
          Subscribe
        </button>

        {subscribedTrain && <p>Subscribed to train: {subscribedTrain}</p>}
      </div>

      {/* ============================
          General Train Update
          ============================ */}

      {lastTrainUpdate && (
        <div>
          <h3>Last Train Update</h3>

          <p>
            Train: {lastTrainUpdate.category} {lastTrainUpdate.trainNumber}
          </p>

          <p>Station EVA: {lastTrainUpdate.stationEva}</p>

          <p>
            Planned arrival:{" "}
            {lastTrainUpdate.plannedArrival
              ? new Date(lastTrainUpdate.plannedArrival).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Actual arrival:{" "}
            {lastTrainUpdate.actualArrival
              ? new Date(lastTrainUpdate.actualArrival).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Planned departure:{" "}
            {lastTrainUpdate.plannedDeparture
              ? new Date(lastTrainUpdate.plannedDeparture).toLocaleString()
              : "N/A"}
          </p>

          <p>
            Actual departure:{" "}
            {lastTrainUpdate.actualDeparture
              ? new Date(lastTrainUpdate.actualDeparture).toLocaleString()
              : "N/A"}
          </p>

          <p>Arrival delay: {lastTrainUpdate.arrivalDelayMinutes} minutes</p>

          <p>
            Departure delay: {lastTrainUpdate.departureDelayMinutes} minutes
          </p>

          <p>
            Platform:{" "}
            {lastTrainUpdate.actualPlatform ??
              lastTrainUpdate.plannedPlatform ??
              "N/A"}
          </p>

          <p>Cancelled: {lastTrainUpdate.cancelled ? "Yes" : "No"}</p>

          <p>
            Last updated:{" "}
            {lastTrainUpdate.updatedAt
              ? new Date(lastTrainUpdate.updatedAt).toLocaleString()
              : "N/A"}
          </p>
        </div>
      )}

      {/* ============================
          Delay Update
          ============================ */}

      {lastDelayUpdate && (
        <div>
          <h3>Last Delay Update</h3>

          <p>Train: {lastDelayUpdate.trainNumber}</p>

          <p>Station EVA: {lastDelayUpdate.stationEva}</p>

          <p>Arrival delay: {lastDelayUpdate.arrivalDelayMinutes} minutes</p>

          <p>
            Departure delay: {lastDelayUpdate.departureDelayMinutes} minutes
          </p>

          <p>Updated: {new Date(lastDelayUpdate.updatedAt).toLocaleString()}</p>
        </div>
      )}

      {/* ============================
          Platform Change
          ============================ */}

      {lastPlatformChange && (
        <div>
          <h3>Last Platform Change</h3>

          <p>Train: {lastPlatformChange.trainNumber}</p>

          <p>Station EVA: {lastPlatformChange.stationEva}</p>

          <p>Planned platform: {lastPlatformChange.plannedPlatform ?? "N/A"}</p>

          <p>Actual platform: {lastPlatformChange.actualPlatform ?? "N/A"}</p>

          <p>
            Updated: {new Date(lastPlatformChange.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* ============================
          Cancellation
          ============================ */}

      {lastCancellation && (
        <div>
          <h3>Last Cancellation Update</h3>

          <p>Train: {lastCancellation.trainNumber}</p>

          <p>Station EVA: {lastCancellation.stationEva}</p>

          <p>Cancelled: {lastCancellation.cancelled ? "Yes" : "No"}</p>

          <p>
            Updated: {new Date(lastCancellation.updatedAt).toLocaleString()}
          </p>
        </div>
      )}

      {/* ============================
          Alert Triggered
          ============================ */}

      {lastAlert && (
        <div>
          <h3>Last Alert</h3>

          <p>Type: {lastAlert.alertType}</p>

          <p>Train: {lastAlert.trainNumber}</p>

          <p>Station EVA: {lastAlert.stationEva ?? "N/A"}</p>

          <p>Title: {lastAlert.title}</p>

          <p>Message: {lastAlert.message}</p>

          <p>Triggered: {new Date(lastAlert.triggeredAt).toLocaleString()}</p>
        </div>
      )}
    </section>
  );
}

export default WebSocketMonitor;
