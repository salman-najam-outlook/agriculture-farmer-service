import { OnModuleDestroy } from '@nestjs/common';
import { Job, JobStatus } from './job/entities/job.entity';

export abstract class BaseJobQueueable implements OnModuleDestroy {
  protected runningJobs: Set<Job> = new Set();
  protected shouldPause = false;
  initRun(job: Job) {
    this.runningJobs.add(job);
  }

  pauseJob() {
    this.shouldPause = true;
  }

  markJobAsComplete(job: Job): void {
    if(job.status !== JobStatus.OnHold) {
      job.status = this.shouldPause && job.status !== JobStatus.Completed ? JobStatus.Pending : JobStatus.Completed;
    }
    this.runningJobs.delete(job);
  }

  removeJob(job: Job): void {
    this.runningJobs.delete(job);
  }

  async onModuleDestroy() {
    this.pauseJob();
    while (this.runningJobs.size) {
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  abstract runJob(job: Job): Promise<Job>;
}
