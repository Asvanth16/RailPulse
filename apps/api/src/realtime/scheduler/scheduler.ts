import { env } from "../../config/env";
import { jobRegistry } from "../jobs/job.registry";
import { DelayMonitorJob } from "../jobs/delay-monitor.job";

export class Scheduler {
  private timeoutId: NodeJS.Timeout | null = null;

  private readonly POLLING_INTERVAL = env.REALTIME_POLLING_INTERVAL_MS;

  private isRunning = false;

  constructor() {
    jobRegistry.register(new DelayMonitorJob());
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

    for (const job of jobRegistry.getJobs()) {
      try {
        await job.execute();
      } catch (error) {
        console.error(`❌ Job '${job.name}' failed:`, error);
      }
    }
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
