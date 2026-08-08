import { deutscheBahnProvider } from "../src/integrations/deutsche-bahn/provider";
import { DbTimeUtil } from "../src/realtime/utils/db-time.util";

async function main(): Promise<void> {
  const eva = "8000105"; // Frankfurt (Main) Hbf

  try {
    const { date, hour } = DbTimeUtil.getCurrentPlanRequest();

    console.log("======================================");
    console.log("🚆 Deutsche Bahn Active Trains");
    console.log("======================================");
    console.log(`Station EVA : ${eva}`);
    console.log(`Plan Date   : ${date}`);
    console.log(`Plan Hour   : ${hour}:00`);
    console.log("======================================\n");

    const timetable =
      await deutscheBahnProvider.getPlannedTimetable(
        eva,
        date,
        hour,
      );

    const trains = timetable.stops
      .filter(
        (stop) =>
          stop.train.trainNumber !== "Unknown" &&
          stop.train.trainNumber !== "UNKNOWN",
      )
      .sort((a, b) => {
        const ta = new Date(
          a.plannedDeparture ??
            a.plannedArrival ??
            0,
        ).getTime();

        const tb = new Date(
          b.plannedDeparture ??
            b.plannedArrival ??
            0,
        ).getTime();

        return ta - tb;
      });

    console.log(`Found ${trains.length} trains\n`);

    for (const stop of trains) {
      console.log(
        `${stop.train.category} ${stop.train.trainNumber}`,
      );

      console.log(
        `Arrival           : ${stop.plannedArrival ?? "-"}`,
      );

      console.log(
        `Actual Arrival    : ${stop.actualArrival ?? "-"}`,
      );

      console.log(
        `Departure         : ${stop.plannedDeparture ?? "-"}`,
      );

      console.log(
        `Actual Departure  : ${stop.actualDeparture ?? "-"}`,
      );

      console.log(
        `Platform          : ${
          stop.plannedPlatform ??
          stop.platform ??
          "-"
        }`,
      );

      console.log(
        `Cancelled         : ${stop.cancelled}`,
      );

      console.log(
        `Arrival Delay     : ${
          stop.arrivalDelayMinutes ?? 0
        } min`,
      );

      console.log(
        `Departure Delay   : ${
          stop.departureDelayMinutes ?? 0
        } min`,
      );

      console.log("--------------------------------------");
    }

    console.log("======================================");
    console.log("✅ Active train test completed.");
  } catch (error) {
    console.error(
      "❌ Failed to fetch active trains:",
      error,
    );

    process.exitCode = 1;
  }
}

main();