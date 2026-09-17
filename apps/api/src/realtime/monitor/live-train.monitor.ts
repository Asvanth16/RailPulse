import { LiveStopDto, LiveTimetableDto } from "../../dto/live";
import { deutscheBahnProvider } from "../../integrations/deutsche-bahn/provider";
import { DbTimeUtil } from "../utils/db-time.util";
import { liveStopMerger } from "../merger/live-stop.merger";

export class LiveTrainMonitor {
  // =========================
  // Realtime changes
  // =========================

  async getStationChanges(eva: number): Promise<LiveTimetableDto> {
    return deutscheBahnProvider.getFullChanges(eva.toString());
  }

  // =========================
  // Planned timetable
  // =========================

  private async getPlannedTimetable(
    eva: number,
    hourOffset = 0,
  ): Promise<LiveTimetableDto> {
    const { date, hour } = DbTimeUtil.getCurrentPlanRequest();

    const currentHour = Number(hour);

    const targetDate = new Date();

    targetDate.setHours(targetDate.getHours() + hourOffset, 0, 0, 0);

    const year = targetDate.getFullYear().toString().slice(-2);

    const month = String(targetDate.getMonth() + 1).padStart(2, "0");

    const day = String(targetDate.getDate()).padStart(2, "0");

    const targetHour =
      hourOffset === 0
        ? hour
        : String((currentHour + hourOffset + 24) % 24).padStart(2, "0");

    const targetDateString = hourOffset === 0 ? date : `${year}${month}${day}`;

    return deutscheBahnProvider.getPlannedTimetable(
      eva.toString(),
      targetDateString,
      targetHour,
    );
  }

  // =========================
  // Live trains for ANY station
  // =========================

  async getUniqueStationLiveTrains(eva: number): Promise<LiveTimetableDto> {
    const [currentHour, nextHour, changes] = await Promise.all([
      this.getPlannedTimetable(eva, 0),
      this.getPlannedTimetable(eva, 1),
      this.getStationChanges(eva),
    ]);

    const plannedStops = [...currentHour.stops, ...nextHour.stops];

    const changedByTrain = new Map<string, LiveStopDto>();

    for (const changedStop of changes.stops) {
      const trainNumber = String(changedStop.train.trainNumber);

      if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
        continue;
      }

      const existing = changedByTrain.get(trainNumber);

      if (!existing) {
        changedByTrain.set(trainNumber, changedStop);
        continue;
      }

      changedByTrain.set(trainNumber, this.mergeStops(existing, changedStop));
    }

    const trainsByNumber = new Map<string, LiveStopDto>();

    // =========================
    // Planned trains
    // =========================

    for (const plannedStop of plannedStops) {
      const trainNumber = String(plannedStop.train.trainNumber);

      if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
        continue;
      }

      const changedStop = changedByTrain.get(trainNumber);

      const mergedTrain = changedStop
        ? liveStopMerger.merge(plannedStop, changedStop)
        : plannedStop;

      const existing = trainsByNumber.get(trainNumber);

      if (!existing) {
        trainsByNumber.set(trainNumber, mergedTrain);
        continue;
      }

      trainsByNumber.set(trainNumber, this.mergeStops(existing, mergedTrain));
    }

    // =========================
    // Changed trains that don't
    // exist in the planned result
    // =========================

    for (const changedStop of changes.stops) {
      const trainNumber = String(changedStop.train.trainNumber);

      if (trainNumber === "Unknown" || trainNumber === "UNKNOWN") {
        continue;
      }

      if (!trainsByNumber.has(trainNumber)) {
        trainsByNumber.set(trainNumber, changedStop);
      }
    }

    return {
      stationEva: eva,
      generatedAt: new Date().toISOString(),
      stops: Array.from(trainsByNumber.values()),
    };
  }

  // =========================
  // Merge duplicate train records
  // =========================

  private mergeStops(first: LiveStopDto, second: LiveStopDto): LiveStopDto {
    return {
      stationEva: second.stationEva || first.stationEva,

      plannedArrival: second.plannedArrival ?? first.plannedArrival,

      actualArrival: second.actualArrival ?? first.actualArrival,

      plannedDeparture: second.plannedDeparture ?? first.plannedDeparture,

      actualDeparture: second.actualDeparture ?? first.actualDeparture,

      plannedPlatform: second.plannedPlatform ?? first.plannedPlatform,

      actualPlatform: second.actualPlatform ?? first.actualPlatform,

      arrivalDelayMinutes:
        second.arrivalDelayMinutes ?? first.arrivalDelayMinutes,

      departureDelayMinutes:
        second.departureDelayMinutes ?? first.departureDelayMinutes,

      cancelled: second.cancelled || first.cancelled,

      train: second.train,

      messages: [...first.messages, ...second.messages].filter(
        (message, index, messages) =>
          messages.findIndex((item) => item.id === message.id) === index,
      ),
    };
  }

  // =========================
  // Find individual train
  // =========================

  async findTrainAtStation(
    eva: number,
    trainNumber: string,
  ): Promise<LiveStopDto | null> {
    const liveTimetable = await this.getUniqueStationLiveTrains(eva);

    return this.findTrain(liveTimetable, trainNumber);
  }

  private findTrain(
    timetable: LiveTimetableDto,
    trainNumber: string,
  ): LiveStopDto | null {
    const normalizedSearch = trainNumber.trim().toUpperCase();

    return (
      timetable.stops.find((stop) => {
        const currentTrainNumber = String(stop.train.trainNumber)
          .trim()
          .toUpperCase();

        if (currentTrainNumber === "UNKNOWN" || currentTrainNumber === "") {
          return false;
        }

        return currentTrainNumber === normalizedSearch;
      }) ?? null
    );
  }
}

export const liveTrainMonitor = new LiveTrainMonitor();
