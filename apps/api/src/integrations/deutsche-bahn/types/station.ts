export interface StationData {
  /**
   * DS100 station code
   * Example: FF
   */
  ds100: string;

  /**
   * EVA station number
   * Example: 8000105
   */
  eva: number;

  /**
   * Station name
   * Example: Frankfurt(Main)Hbf
   */
  name: string;

  /**
   * Meta stations separated by "|"
   * Example: "8000105|8000106"
   */
  meta?: string;

  /**
   * Platforms separated by "|"
   * Example: "1|2|3|4"
   */
  p?: string;
}

export interface MultipleStationData {
  station: StationData[];
}