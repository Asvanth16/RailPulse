import { deutscheBahnClient } from "./client";
import { deutscheBahnMapper } from "./mapper";

import {
  LiveStationDto,
  LiveTimetableDto,
} from "../../dto/live";

import {
  RailwayApiError,
  RailwayAuthenticationError,
  RailwayNotFoundError,
  RailwayRateLimitError,
} from "./errors";

export class DeutscheBahnProvider {
  async searchStations(
    pattern: string
  ): Promise<LiveStationDto[]> {
    const response = await this.execute(() =>
      deutscheBahnClient.searchStations(pattern)
    );

    return deutscheBahnMapper.mapStations(response);
  }

  async getPlannedTimetable(
    evaNo: string,
    date: string,
    hour: string
  ): Promise<LiveTimetableDto> {
    const response = await this.execute(() =>
      deutscheBahnClient.getPlan(evaNo, date, hour)
    );

    return deutscheBahnMapper.mapTimetable(response);
  }

  async getFullChanges(
    evaNo: string
  ): Promise<LiveTimetableDto> {
    const response = await this.execute(() =>
      deutscheBahnClient.getFullChanges(evaNo)
    );

    return deutscheBahnMapper.mapTimetable(response);
  }

  async getRecentChanges(
    evaNo: string
  ): Promise<LiveTimetableDto> {
    const response = await this.execute(() =>
      deutscheBahnClient.getRecentChanges(evaNo)
    );

    return deutscheBahnMapper.mapTimetable(response);
  }

  private async execute<T>(
    operation: () => Promise<T>
  ): Promise<T> {
    try {
      return await operation();
    } catch (error: any) {
      const status = error.response?.status;

      switch (status) {
        case 401:
        case 403:
          throw new RailwayAuthenticationError();

        case 404:
          throw new RailwayNotFoundError();

        case 429:
          throw new RailwayRateLimitError();

        default:
          throw new RailwayApiError(
            error.message ?? "Unknown Deutsche Bahn API error"
          );
      }
    }
  }
}

export const deutscheBahnProvider =
  new DeutscheBahnProvider();