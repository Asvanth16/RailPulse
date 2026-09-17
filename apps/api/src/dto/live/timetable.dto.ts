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
   * Stations this train passed through before this stop,
   * in journey order.
   *
   * Derived from the DB path field.
   */
  previousStations?: string[];

  /**
   * Stations this train will pass through after this stop,
   * in journey order.
   *
   * Derived from the DB path field.
   */
  nextStations?: string[];

  /**
   * First station in the train's journey.
   *
   * Best-effort value derived from the DB path data.
   */
  origin?: string;

  /**
   * Final station in the train's journey.
   *
   * Best-effort value derived from the DB path data.
   */
  destination?: string;

  /**
   * Train information
   */
  train: LiveTrainDto;

  /**
   * Associated messages
   */
  messages: LiveMessageDto[];
}
