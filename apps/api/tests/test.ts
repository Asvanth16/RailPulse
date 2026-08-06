import { deutscheBahnProvider } from "../src/integrations/deutsche-bahn/provider";
import { DbTimeUtil } from "../src/realtime/utils/db-time.util";

async function main() {
  const eva = "8000105"; // Frankfurt (Main) Hbf

  const { date, hour } = DbTimeUtil.getCurrentPlanRequest();

  console.log("======================================");
  console.log("🚆 Deutsche Bahn Active Trains");
  console.log("======================================");
  console.log(`Station EVA : ${eva}`);
  console.log(`Plan Date   : ${date}`);
  console.log(`Plan Hour   : ${hour}:00`);
  console.log("======================================\n");

  const timetable = await deutscheBahnProvider.getPlannedTimetable(
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
      const ta =
        new Date(
          a.plannedDeparture ??
            a.plannedArrival ??
            0,
        ).getTime();

      const tb =
        new Date(
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
    console.log(`Arrival   : ${stop.plannedArrival ?? "-"}`);
    console.log(`Departure : ${stop.plannedDeparture ?? "-"}`);
    console.log(`Platform  : ${stop.plannedPlatform ?? "-"}`);
    console.log("--------------------------------------");
  }
}

main().catch(console.error);