import { LiveStopDto, LiveTimetableDto } from "../../dto/live";
import { deutscheBahnProvider } from "../../integrations/deutsche-bahn/provider";
import { DbTimeUtil } from "../utils/db-time.util";
import { liveStopMerger } from "../merger/live-stop.merger";

export class LiveTrainMonitor {
  async getStationChanges(eva: number): Promise<LiveTimetableDto> {
    return deutscheBahnProvider.getFullChanges(eva.toString());
  }

  private async getPlannedTimetable(eva: number): Promise<LiveTimetableDto> {
    const { date, hour } = DbTimeUtil.getCurrentPlanRequest();

    return deutscheBahnProvider.getPlannedTimetable(eva.toString(), date, hour);
  }

  async findTrainAtStation(
    eva: number,
    trainNumber: string,
  ): Promise<LiveStopDto | null> {
    let plannedTrain: LiveStopDto | null = null;

    try {
      const plannedTimetable = await this.getPlannedTimetable(eva);

      plannedTrain = this.findTrain(plannedTimetable, trainNumber);
    } catch {
      // Ignore plan lookup failures.
      // Realtime data is more important.
    }

    const changedTimetable = await this.getStationChanges(eva);

    const changedTrain = this.findTrain(changedTimetable, trainNumber);

    if (!plannedTrain && !changedTrain) {
      return null;
    }

    if (!plannedTrain) {
      return changedTrain!;
    }

    if (!changedTrain) {
      return plannedTrain;
    }

    return liveStopMerger.merge(plannedTrain, changedTrain);
  }

  private normalizeTrainName(stop: LiveStopDto): string {
    return `${stop.train.category} ${stop.train.trainNumber}`
      .trim()
      .toUpperCase();
  }

  private findTrain(
    timetable: LiveTimetableDto,
    trainNumber: string,
  ): LiveStopDto | null {
    const normalizedSearch = trainNumber.trim().toUpperCase();

    return (
      timetable.stops.find((stop) => {
        if (
          stop.train.trainNumber === "Unknown" ||
          stop.train.trainNumber === "UNKNOWN"
        ) {
          return false;
        }

        return this.normalizeTrainName(stop) === normalizedSearch;
      }) ?? null
    );
  }
}

export const liveTrainMonitor = new LiveTrainMonitor();
