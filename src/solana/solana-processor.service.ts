import { Inject, Injectable, Logger } from '@nestjs/common';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { SolanaService } from './solana.service';
import Redlock, { Lock } from 'redlock';
import Redis from 'ioredis';

@Injectable()
@Processor(process.env.SOLANA_QUEUE || 'solana-queue')
export class SolanaProcessorService {
  private readonly logger = new Logger(SolanaProcessorService.name);
  private readonly redlock: Redlock;

  constructor(
    private readonly solanaService: SolanaService,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis
  ) {
    this.logger.log('SolanaProcessorService initialized and listening for jobs');
    this.redlock = new Redlock([this.redisClient], {
      retryCount: 10,
    });
  }

  @Process('process-deforestation')
  async handleDeforestation(job: Job) {
    this.logger.debug(`Starting to process deforestation job ${job.id}`);

    const data = job.data;
    const lockKey = `lock:deforestation:${job.id}`;
    let lock: Lock;

    try {
      lock = await this.redlock.acquire([lockKey], 6000);

      this.logger.debug(`Processing data for job ${job.id}:`, data);

      const result = await this.solanaService.createDeforestationTransaction(data);

      if (!result?.success) {
        throw new Error(`Failed to process deforestation data: ${JSON.stringify(result) || 'Unknown error'}`);
      }

      this.logger.debug(`Successfully processed deforestation job ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error processing deforestation job ${job.id}:`, error);
      // Rethrow the error to trigger Bull's retry mechanism
      throw error;
    } finally {
      if (lock) {
        try {
          await lock.release();
          console.log('lock released for ', lockKey);
          this.logger.debug(`Lock released for ${lockKey}`);
        } catch (releaseErr) {
          this.logger.warn(`Failed to release lock for ${lockKey}:`, releaseErr);
        }
      }
    }
  }

  @Process('process-crop-yield')
  async handleCropYield(job: Job) {
    this.logger.debug(`Starting to process crop yield job ${job.id}`);

    const data = job.data;
    const lockKey = `lock:crop-yield:${job.id}`;
    let lock: Lock;

    try {
      lock = await this.redlock.acquire([lockKey], 6000);

      this.logger.debug(`Processing data for job ${job.id}:`, data);

      const result = await this.solanaService.createCropYieldTransaction(data);

      if (!result?.success) {
        throw new Error(`Failed to process crop yield data: ${result || 'Unknown error'}`);
      }

      this.logger.debug(`Successfully processed crop yield job ${job.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Error processing crop yield job ${job.id}:`, error);
      // Rethrow the error to trigger Bull's retry mechanism
      throw error;
    } finally {
      if (lock) {
        try {
          await lock.release();
          console.log('lock released for ', lockKey);
          this.logger.debug(`Lock released for ${lockKey}`);
        } catch (releaseErr) {
          this.logger.warn(`Failed to release lock for ${lockKey}:`, releaseErr);
        }
      }
    }
  }
}
