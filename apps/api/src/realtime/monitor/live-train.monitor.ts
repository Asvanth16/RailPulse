import { LiveStopDto, LiveTimetableDto } from "../../dto/live";
import { deutscheBahnProvider } from "../../integrations/deutsche-bahn/provider";

export class LiveTrainMonitor {
  async getStationChanges(eva: number): Promise<LiveTimetableDto> {
    return deutscheBahnProvider.getFullChanges(eva.toString());
  }

  async findTrainAtStation(
    eva: number,
    trainNumber: string,
  ): Promise<LiveStopDto | null> {
    const timetable = await this.getStationChanges(eva);

    const normalizedSearch = trainNumber.trim().toUpperCase();

    // console.log(
    //   timetable.stops
    //     .filter((stop) => stop.train.trainNumber !== "Unknown")
    //     .map((stop) => `${stop.train.category} ${stop.train.trainNumber}`),
    // );

    return (
      timetable.stops.find((stop) => {
        if (
          stop.train.trainNumber === "Unknown" ||
          stop.train.trainNumber === "UNKNOWN"
        ) {
          return false;
        }

        const fullTrainName = `${stop.train.category} ${stop.train.trainNumber}`
          .trim()
          .toUpperCase();

        return fullTrainName === normalizedSearch;
      }) ?? null
    );
  }
}

export const liveTrainMonitor = new LiveTrainMonitor();
