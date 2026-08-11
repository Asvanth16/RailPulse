import { env } from "../../config/env";
import { jobRegistry } from "../jobs/job.registry";
import { DelayMonitorJob } from "../jobs/delay-monitor.job";
import { PlatformMonitorJob } from "../jobs/platform-monitor.job";
import { CancellationMonitorJob } from "../jobs/cancellation-monitor.job";
import { ReminderMonitorJob } from "../jobs/reminder-monitor.job";
import { LiveTrainUpdateJob } from "../jobs/live-train-update.job";
import { SchedulerJobStatus, SchedulerStatus } from "./scheduler.types";

export class Scheduler {
  private timeoutId: NodeJS.Timeout | null = null;

  private readonly POLLING_INTERVAL = env.REALTIME_POLLING_INTERVAL_MS;

  private isRunning = false;

  private readonly jobStatuses = new Map<string, SchedulerJobStatus>();

  private lastCycleStartedAt: string | null = null;

  private lastCycleCompletedAt: string | null = null;

  constructor() {
    jobRegistry.register(new LiveTrainUpdateJob());

    jobRegistry.register(new DelayMonitorJob());
    jobRegistry.register(new PlatformMonitorJob());
    jobRegistry.register(new CancellationMonitorJob());
    jobRegistry.register(new ReminderMonitorJob());

    for (const job of jobRegistry.getJobs()) {
      this.jobStatuses.set(job.name, {
        name: job.name,
        lastStartedAt: null,
        lastCompletedAt: null,
        lastSuccess: null,
        lastError: null,
      });
    }
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    console.log("🚆 Real-Time Scheduler started");

    await this.scheduleNextRun();
  }

  private async scheduleNextRun(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    await this.runJobs();

    if (!this.isRunning) {
      return;
    }

    this.timeoutId = setTimeout(async () => {
      await this.scheduleNextRun();
    }, this.POLLING_INTERVAL);
  }

  private async runJobs(): Promise<void> {
    console.log("🔄 Running realtime jobs...");

    this.lastCycleStartedAt = new Date().toISOString();

    for (const job of jobRegistry.getJobs()) {
      const status = this.jobStatuses.get(job.name);

      if (!status) {
        continue;
      }

      status.lastStartedAt = new Date().toISOString();
      status.lastError = null;

      try {
        await job.execute();

        status.lastSuccess = true;
        status.lastCompletedAt = new Date().toISOString();
      } catch (error) {
        status.lastSuccess = false;
        status.lastCompletedAt = new Date().toISOString();

        status.lastError =
          error instanceof Error ? error.message : String(error);

        console.error(`❌ Job '${job.name}' failed:`, error);
      }
    }

    this.lastCycleCompletedAt = new Date().toISOString();
  }

  getStatus(): SchedulerStatus {
    return {
      isRunning: this.isRunning,
      pollingIntervalMs: this.POLLING_INTERVAL,
      lastCycleStartedAt: this.lastCycleStartedAt,
      lastCycleCompletedAt: this.lastCycleCompletedAt,
      jobs: Array.from(this.jobStatuses.values()).map((status) => ({
        ...status,
      })),
    };
  }

  stop(): void {
    this.isRunning = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    console.log("🛑 Scheduler stopped");
  }
}

export const scheduler = new Scheduler();
