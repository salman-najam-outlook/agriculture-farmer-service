import { forwardRef, Module } from '@nestjs/common';
import { JobService } from './job.service';
import { JobResolver } from './job.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Job } from './entities/job.entity';
import { Sequelize } from 'sequelize-typescript';
import { ProductionPlaceModule } from 'src/due-diligence/production-place/production-place.module';
import { DeforestationModule } from 'src/deforestation/deforestation.module';
import { DiligenceReportModule } from 'src/diligence-report/diligence-report.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronJobService } from './cron-job.service'
import { ApprovalFlowSettingsService } from '../due-diligence/approval-flow-setting/approval-flow-settings.service';


@Module({
  imports: [
    SequelizeModule.forFeature([Job]),
    ScheduleModule.forRoot(),
    forwardRef(() => ProductionPlaceModule),
    forwardRef(() => DeforestationModule),
    forwardRef(() => DiligenceReportModule),
  ],
  providers: [JobResolver, JobService, CronJobService, ApprovalFlowSettingsService, { provide: 'SEQUELIZE', useExisting: Sequelize }],
  exports: [JobService],
})
export class JobModule {}
