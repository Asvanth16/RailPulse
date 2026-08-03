import { Job } from "./job.interface";

export class HeartbeatJob implements Job {
  readonly name = "heartbeat";

  async execute(): Promise<void> {
    console.log(`💓 ${this.name} executed at ${new Date().toISOString()}`);
  }
}