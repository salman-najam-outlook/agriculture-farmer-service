import { forwardRef, Inject, Injectable, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { CreateJobInput } from './dto/create-job.input';
import { UpdateJobInput } from './dto/update-job.input';
import { InjectModel } from '@nestjs/sequelize';
import { Job, JobStatus } from './entities/job.entity';
import * as moment from 'moment';
import { LOCK, Op } from 'sequelize';
import { ProductionPlaceService } from 'src/due-diligence/production-place/production-place.service';
import { DeforestationService } from 'src/deforestation/deforestation.service';
import { DiligenceReportService } from 'src/diligence-report/diligence-report.service';

export interface JobModule {
  pausedJobIds: number[];
  runJob(job: Job): Promise<Job>;
  pauseJob(jobId: number): void;
}

@Injectable()
export class JobService implements OnApplicationBootstrap, OnModuleDestroy {
  private processingJobs: Set<Job> = new Set();
  private concurrentProcessCount: number = parseInt(process.env.CONCURRENT_JOB_QUEUE_LIMIT) || 2;
  private shouldPause = false;
  private isRunning = false;
  constructor(
    @InjectModel(Job)
    private JobModel: typeof Job,

    @Inject(forwardRef(() => ProductionPlaceService))
    private productionPlaceService: ProductionPlaceService,

    @Inject(forwardRef(() => DeforestationService))
    private deforestationService: DeforestationService,

    @Inject(forwardRef(() => DiligenceReportService))
    private diligenceReportService: DiligenceReportService,
  ) {}

  onApplicationBootstrap() {
    this.initJobsProcessing();
  }

  async onModuleDestroy(signal?: string) {
    this.shouldPause = true;
  }

  async create(createJobInput: CreateJobInput) {
    try {
      const job = await this.JobModel.create({
        ...createJobInput,
        availableAttempts: createJobInput.availableAttempts ?? 0,
        availableAt: createJobInput.availableAt ? moment(createJobInput.availableAt) : moment().subtract(1, 'm'),
        status: JobStatus.Pending,
        priority: createJobInput.priority ?? 0,
      });
  
      this.initJobsProcessing();
      return job;
    } catch (error) {
      console.error('FAILED TO CREATE JOB', error);
    }
  }

  async findOne(id: number) {
    return this.JobModel.findByPk(id);
  }

  async getJobs(jobIds){
    return this.JobModel.findAll({
      where: {
        id: {
          [Op.in]: jobIds.jobIds,
        },
      },
    });
  }

  async findByExternalId(externalId) {
    return this.JobModel.findOne({
      where: {
        externalId,
      }
    });
  }

  async findJobByModuleIDAndType(payload:any){
    return this.JobModel.findOne({
      where: {
        modelId:payload.modelId,
        modelType:payload.modelType,
        status:{
          [Op.notIn]:[JobStatus.Completed, JobStatus.Failed]
        }
      }
    });
  }

  async pendingJobIdsByPriority(limit: number) {
    const now = moment();
    const models = await this.JobModel.findAll({
      attributes: ['id'],
      where: {
        status: JobStatus.Pending,
        availableAt: {
          [Op.lte]: now,
        },
      },
      order: [['priority', 'DESC']],
      limit,
      skipLocked: true,
    });
    return models.map(item => item.id);
  }

  async pendingByPriority(limit: number, lock?: LOCK) {
    const ids = await this.pendingJobIdsByPriority(limit);
    if(!ids.length) return [];
    return this.JobModel.findAll({
      where: {
        status: JobStatus.Pending,
        id: {
          [Op.in]: ids,
        },
      },
      limit,
      lock,
      skipLocked: true,
    });
  }

  update({ id, ...updateInput }: UpdateJobInput) {
    return this.JobModel.update(
      {
        ...updateInput,
      },
      {
        where: {
          id,
        },
      }
    );
  }

  hasProcessingJobs() {
    return this.processingJobs.size > 0;
  }

  async initJobsProcessing() {
    try {
      if (this.shouldPause || this.isRunning) return;
      const pendingJobs = await this.pendingByPriority(this.concurrentProcessCount);
      if (pendingJobs.length) {
        this.isRunning = true;
        pendingJobs.forEach((job) => this.processingJobs.add(job));
        this.runJobs();
      } else {
        this.isRunning = false;
      }
    } catch (error) {
      console.error('FAILED TO INIT JOBS PROCESSING', error);
    }
  }

  async runJobs() {
    await Promise.allSettled(
      [...this.processingJobs].map(async (job) => {
        try {
          if (job.status !== JobStatus.Pending) return;
          await job.update({
            status: JobStatus.Processing,
            reservedAt: moment(),
          });

          const payload = job.payload;
          const module = payload.module;
          switch (module) {
            case 'PRODUCTION_PLACE':
              await this.productionPlaceService.runJob(job);
              break;
            case 'DEFORESTATION_REPORT':
              await this.deforestationService.runJob(job);
              break;
            case 'DILIGENCE_REPORT':
              await this.diligenceReportService.runJob(job);
              break;
            case 'PRODUCTION_PLACE_WARNING':
              await this.productionPlaceService.runJob(job);
              break;
            default:
              job.status = JobStatus.Completed;
              break;
          }
          await job.save();
        } catch (error) {
          await job.update({
            status: job.availableAttempts ? JobStatus.Pending : JobStatus.Failed,
            context: {
              ...(job.context ?? {}),
              error: error.message,
            },
            availableAttempts: job.availableAttempts ? job.availableAttempts - 1 : 0,
          });
        } finally {
          this.processingJobs.delete(job);
        }
      })
    );
    this.isRunning = false;
    this.initJobsProcessing();
  }
}
