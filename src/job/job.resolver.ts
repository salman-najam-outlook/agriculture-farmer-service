import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { JobService } from './job.service';
import { Job } from './entities/job.entity';
import { CreateJobInput, JobIdsInput } from './dto/create-job.input';

@Resolver(() => Job)
export class JobResolver {
  constructor(private readonly jobService: JobService) {}
  @Query(() => Job, { name: 'job', nullable: true })
  findOne(@Args('id', { type: () => Int }) id: number) {
    return this.jobService.findOne(id);
  }

  @Query(() => [Job], { name: 'pendingJobs', nullable: true })
  pendingJobs(@Args('limit', { type: () => Int }) limit: number) {
    return this.jobService.pendingByPriority(limit);
  }

  @Mutation(() => Job)
  createJob(@Args('createJobInput') createJobInput: CreateJobInput) {
    return this.jobService.create(createJobInput);
  }

 @Mutation(() => [Job])
  getJobs(@Args('jobIds') jobIds: JobIdsInput) {
    return this.jobService.getJobs(jobIds);
  }
}
