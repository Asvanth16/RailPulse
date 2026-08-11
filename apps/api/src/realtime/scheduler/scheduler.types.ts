export interface SchedulerJobStatus {
  name: string;
  lastStartedAt: string | null;
  lastCompletedAt: string | null;
  lastSuccess: boolean | null;
  lastError: string | null;
}

export interface SchedulerStatus {
  isRunning: boolean;
  pollingIntervalMs: number;
  lastCycleStartedAt: string | null;
  lastCycleCompletedAt: string | null;
  jobs: SchedulerJobStatus[];
}