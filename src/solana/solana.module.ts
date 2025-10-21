import { forwardRef, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { DeforestationModule } from '../deforestation/deforestation.module';
import { SolanaService } from './solana.service';
import { SolanaProcessorService } from './solana-processor.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SolanaTransaction } from './entities/solana-transaction.entity';
import { Sequelize } from 'sequelize-typescript';
import { RedisModule } from '../redis/redis.module';
import { SolanaController } from './solana.controller';


@Module({
  imports: [
    SequelizeModule.forFeature([SolanaTransaction]),
    forwardRef(() => DeforestationModule),
    BullModule.registerQueue({
      name: process.env.SOLANA_QUEUE || 'solana-queue',
      redis: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 300,
        },
        removeOnComplete: true,
        removeOnFail: false,
        lifo: false,
      },
    }),
    RedisModule,
  ],
  controllers: [SolanaController],
  providers: [
    SolanaService,
    SolanaProcessorService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },
  ],
  exports: [SolanaService, BullModule],
})
export class SolanaModule {}
