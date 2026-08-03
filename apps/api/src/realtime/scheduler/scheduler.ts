import { jobRegistry } from "../jobs/job.registry";
import { HeartbeatJob } from "../jobs/heartbeat.job";
import { DelayMonitorJob } from "../jobs/delay-monitor.job";

export class Scheduler {
  constructor() {
    jobRegistry.register(new DelayMonitorJob());
  }

  async start(): Promise<void> {
    console.log("🚆 Real-Time Scheduler started");

    for (const job of jobRegistry.getJobs()) {
      await job.execute();
    }
  }

  stop(): void {
    console.log("🛑 Scheduler stopped");
  }
}

export const scheduler = new Scheduler();
