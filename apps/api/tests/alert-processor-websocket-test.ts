import { createServer } from "http";
import { io as ioClient, Socket } from "socket.io-client";

import app from "../src/app";
import { prisma } from "../src/lib/prisma";
import { initializeWebSocket } from "../src/realtime/websocket/websocket.server";
import { alertProcessor } from "../src/realtime/processor/alert.processor";
import { LiveStopDto } from "../src/dto/live";

const TEST_PORT = 5001;

const USER_ID = "cmsh6np750000knlc6azyo1u2";

const ALERT_ID = "cmshqy80o000277lcg6t7n1mj";

async function main(): Promise<void> {
  const httpServer = createServer(app);

  initializeWebSocket(httpServer);

  await new Promise<void>((resolve) => {
    httpServer.listen(TEST_PORT, resolve);
  });

  console.log(
    `🧪 Test server running on port ${TEST_PORT}`,
  );

  const socket: Socket = ioClient(
    `http://localhost:${TEST_PORT}`,
    {
      transports: ["websocket"],
    },
  );

  await new Promise<void>((resolve, reject) => {
    socket.on("connect_error", reject);

    socket.on("connect", () => {
      console.log(
        `🔌 Test WebSocket connected: ${socket.id}`,
      );

      socket.emit("subscribe:user", {
        userId: USER_ID,
      });
    });

    socket.on("subscription:success", (data) => {
      if (data.subscription === "user") {
        console.log(
          "📡 User subscription successful:",
          data,
        );

        resolve();
      }
    });

    socket.on("subscription:error", (data) => {
      reject(
        new Error(
          `Subscription failed: ${data.message}`,
        ),
      );
    });
  });

  const alert = await prisma.alert.findUnique({
    where: {
      id: ALERT_ID,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!alert) {
    throw new Error("Test alert not found.");
  }

  if (alert.userId !== USER_ID) {
    throw new Error(
      "Test alert does not belong to the test user.",
    );
  }

  console.log("\n🚨 Testing real alert:");
  console.log({
    id: alert.id,
    trainNumber: alert.trainNumber,
    alertType: alert.alertType,
    userId: alert.userId,
  });

  const train: LiveStopDto = {
    stationEva: 8000105,

    plannedArrival: "2026-08-09T19:00:00.000Z",
    actualArrival: "2026-08-09T19:00:00.000Z",

    plannedDeparture: "2026-08-09T19:05:00.000Z",
    actualDeparture: "2026-08-09T19:05:00.000Z",

    plannedPlatform: "7",
    actualPlatform: "9",

    arrivalDelayMinutes: 0,
    departureDelayMinutes: 0,

    cancelled: false,

    train: {
      trainNumber: "ICE 1558",
      category: "ICE",
      operator: "DB Fernverkehr",
    },

    messages: [],
  };

  const alertReceived = new Promise<void>(
    (resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error(
            "Timed out waiting for alert:triggered.",
          ),
        );
      }, 10_000);

      socket.on("alert:triggered", (data) => {
        clearTimeout(timeout);

        console.log("\n🔔 WebSocket alert received:");
        console.dir(data, { depth: null });

        resolve();
      });
    },
  );

  console.log("\n⚙️ Running AlertProcessor...\n");

  await alertProcessor.processPlatform(
    alert,
    train,
  );

  await alertReceived;

  console.log(
    "\n✅ Real AlertProcessor → WebSocket test passed.",
  );

  socket.disconnect();

  await new Promise<void>((resolve) => {
    httpServer.close(() => resolve());
  });
}

main()
  .catch((error) => {
    console.error("\n❌ Test failed:");
    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });