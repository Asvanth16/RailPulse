import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket"],
});

const USER_ID = "cmsh6np750000knlc6azyo1u2";
const TRAIN_NUMBER = "2817";

socket.on("connect", () => {
  console.log("=================================");
  console.log("🔌 Test WebSocket connected");
  console.log(`Socket ID: ${socket.id}`);
  console.log("=================================");

  // Subscribe to a specific train
  socket.emit("subscribe:train", {
    trainNumber: TRAIN_NUMBER,
  });

  // Subscribe to the user's alert room
  socket.emit("subscribe:user", {
    userId: USER_ID,
  });
});

socket.on("connection:ready", (data) => {
  console.log("📡 Connection ready event received:");
  console.log(data);
});

socket.on("subscription:success", (data) => {
  console.log("📡 Subscription successful:");
  console.log(data);
});

socket.on("subscription:error", (data) => {
  console.error("❌ Subscription failed:");
  console.error(data);
});

socket.on("train:updated", (data) => {
  console.log("🚆 Train update received:");
  console.dir(data, { depth: null });
});

socket.on("alert:triggered", (data) => {
  console.log("🔔 Alert received:");
  console.dir(data, { depth: null });

  socket.disconnect();
});

socket.on("disconnect", (reason) => {
  console.log(
    `🔌 Test WebSocket disconnected: ${reason}`,
  );

  process.exit(0);
});

socket.on("connect_error", (error) => {
  console.error(
    "❌ WebSocket connection failed:",
    error.message,
  );

  process.exit(1);
});