import { OperationalHistoryType } from "../generated/prisma/enums";

export interface OperationalHistoryDto {
  id: string;

  trainNumber: string;

  trainRunId: string;

  type: OperationalHistoryType;

  previousValue: string | null;

  currentValue: string | null;

  message: string;

  occurredAt: string;

  createdAt: string;

  stationEva: number | null;
}

export interface OperationsTrainHistoryResponse {
  trainNumber: string;

  history: OperationalHistoryDto[];
}

export interface RecentOperationalHistoryDto extends OperationalHistoryDto {
  category: string;
}

export interface OperationsRecentHistoryResponse {
  history: RecentOperationalHistoryDto[];
}
