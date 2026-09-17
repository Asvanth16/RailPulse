import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  connectWebSocket,
  disconnectWebSocket,
  onOperationsEvent,
  onSubscriptionError,
  onSubscriptionSuccess,
  socket,
  subscribeToOperations,
} from "../websocket/socket";

import type {
  OperationsWebSocketEvent,
  SubscriptionErrorPayload,
  SubscriptionSuccessPayload,
} from "../websocket/websocket.types";

interface UseOperationsWebSocketOptions {
  onEvent?: (
    event: OperationsWebSocketEvent,
  ) => void;
}

export function useOperationsWebSocket({
  onEvent,
}: UseOperationsWebSocketOptions = {}) {
  const [connected, setConnected] =
    useState(socket.connected);

  const [subscribed, setSubscribed] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const handleEvent = useCallback(
    (event: OperationsWebSocketEvent) => {
      onEvent?.(event);
    },
    [onEvent],
  );

  useEffect(() => {
    function handleConnect() {
      setConnected(true);

      setSubscribed(false);

      setError(null);

      subscribeToOperations();
    }

    function handleDisconnect() {
      setConnected(false);

      setSubscribed(false);
    }

    function handleSubscriptionSuccess(
      payload: SubscriptionSuccessPayload,
    ) {
      if (
        payload.subscription ===
        "operations"
      ) {
        setSubscribed(true);

        setError(null);
      }
    }

    function handleSubscriptionError(
      payload: SubscriptionErrorPayload,
    ) {
      setSubscribed(false);

      setError(payload.message);
    }

    socket.on(
      "connect",
      handleConnect,
    );

    socket.on(
      "disconnect",
      handleDisconnect,
    );

    const removeEvents =
      onOperationsEvent(
        handleEvent,
      );

    const removeSubscriptionSuccess =
      onSubscriptionSuccess(
        handleSubscriptionSuccess,
      );

    const removeSubscriptionError =
      onSubscriptionError(
        handleSubscriptionError,
      );

    connectWebSocket();

    /*
     * If the socket was already connected
     * before this effect was registered,
     * subscribe immediately.
     */
    if (socket.connected) {
      subscribeToOperations();
    }

    return () => {
      socket.off(
        "connect",
        handleConnect,
      );

      socket.off(
        "disconnect",
        handleDisconnect,
      );

      removeEvents();

      removeSubscriptionSuccess();

      removeSubscriptionError();

      disconnectWebSocket();
    };
  }, [handleEvent]);

  return {
    connected,
    subscribed,
    error,
  };
}