export interface OperationsStationDto {
  eva: number;
  ds100: string;
  name: string;
}

export interface OperationsMonitoredStationDto {
  id: string;
  eva: number;
  ds100: string;
  name: string;
  isEnabled: boolean;
}