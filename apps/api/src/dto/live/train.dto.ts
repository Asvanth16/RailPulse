export interface LiveTrainDto {
  trainNumber: string;
  category: string;
  operator: string;

  flags?: string;
  tripType?: string;
}