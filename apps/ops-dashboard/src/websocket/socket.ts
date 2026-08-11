import { io, Socket } from "socket.io-client";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

export const socket: Socket = io(API_URL, {
  autoConnect: false,
  transports: ["websocket"],
});

export function connectWebSocket(): void {
  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectWebSocket(): void {
  if (socket.connected) {
    socket.disconnect();
  }
}