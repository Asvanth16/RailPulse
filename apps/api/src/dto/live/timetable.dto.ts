import { LiveMessageDto } from "./message.dto";
import { LiveTrainDto } from "./train.dto";

export interface LiveStopDto {
  stationEva: number;

  /**
   * Planned arrival time (ISO 8601)
   */
  plannedArrival?: string;

  /**
   * Actual arrival time (ISO 8601)
   */
  actualArrival?: string;

  /**
   * Planned departure time (ISO 8601)
   */
  plannedDeparture?: string;

  /**
   * Actual departure time (ISO 8601)
   */
  actualDeparture?: string;

  /**
   * Planned platform
   */
  plannedPlatform?: string;

  /**
   * Actual platform
   */
  actualPlatform?: string;

  /**
   * Arrival delay in minutes
   */
  arrivalDelayMinutes?: number;

  /**
   * Departure delay in minutes
   */
  departureDelayMinutes?: number;

  /**
   * Whether the stop is cancelled
   */
  cancelled: boolean;

  /**
   * Train information
   */
  train: LiveTrainDto;

  /**
   * Associated messages
   */
  messages: LiveMessageDto[];
}

export interface LiveTimetableDto {
  /**
   * Station EVA number
   */
  stationEva: number;

  /**
   * Time when this response was generated (ISO 8601)
   */
  generatedAt: string;

  /**
   * Live timetable stops
   */
  stops: LiveStopDto[];
}