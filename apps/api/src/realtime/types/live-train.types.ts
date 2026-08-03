export interface LiveTrain {
  trainNumber: string;

  trainName: string;

  currentStationEva: number;
  currentStationName: string;

  currentPlatform?: string;
  plannedPlatform?: string;

  delayMinutes: number;

  cancelled: boolean;

  departureTime?: Date;
  arrivalTime?: Date;

  lastUpdated: Date;
}