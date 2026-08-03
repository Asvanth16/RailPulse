import { Job } from "./job.interface";

export class JobRegistry {
  private readonly jobs: Job[] = [];

  register(job: Job): void {
    this.jobs.push(job);
  }

  getJobs(): Job[] {
    return this.jobs;
  }
}

export const jobRegistry = new JobRegistry();