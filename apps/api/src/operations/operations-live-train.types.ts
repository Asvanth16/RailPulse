import { LiveStopDto } from "../dto/live";

export interface OperationsLiveTrainDto extends LiveStopDto {}

export interface OperationsLiveTrainsResponse {
  stationEva: number | null;
  count: number;
  trains: OperationsLiveTrainDto[];
}