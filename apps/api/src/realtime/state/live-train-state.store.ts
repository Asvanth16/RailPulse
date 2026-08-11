import { cacheService } from "../../cache/cache.service";
import { LiveStopDto } from "../../dto/live";

const LIVE_TRAIN_STATE_TTL = 60;

export class LiveTrainStateStore {
  private readonly keyPrefix = "realtime:live-train:";

  private readonly stationKeyPrefix = "realtime:live-trains:station:";

  private trainKey(trainNumber: string): string {
    return `${this.keyPrefix}${trainNumber}`;
  }

  private stationKey(stationEva: number): string {
    return `${this.stationKeyPrefix}${stationEva}`;
  }

  async set(train: LiveStopDto): Promise<void> {
    const trainNumber = String(train.train.trainNumber);

    await cacheService.set(
      this.trainKey(trainNumber),
      train,
      LIVE_TRAIN_STATE_TTL,
    );
  }

  async get(trainNumber: string): Promise<LiveStopDto | null> {
    return cacheService.get<LiveStopDto>(
      this.trainKey(trainNumber),
    );
  }

  async setStationTrains(
    stationEva: number,
    trains: LiveStopDto[],
  ): Promise<void> {
    await cacheService.set(
      this.stationKey(stationEva),
      trains,
      LIVE_TRAIN_STATE_TTL,
    );
  }

  async getStationTrains(
    stationEva: number,
  ): Promise<LiveStopDto[]> {
    return (
      (await cacheService.get<LiveStopDto[]>(
        this.stationKey(stationEva),
      )) ?? []
    );
  }

  async delete(trainNumber: string): Promise<void> {
    await cacheService.delete(
      this.trainKey(trainNumber),
    );
  }
}

export const liveTrainStateStore =
  new LiveTrainStateStore();