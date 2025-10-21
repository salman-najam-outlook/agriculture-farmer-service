import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailSchedulerService } from './email-scheduler.service'
import { EmailSchedulerController } from './email-scheduler.controller';
import { MailModule } from '../mail/mail.module';
import { JobModule } from '../job/job.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { Job } from '../job/entities/job.entity';
import { Geofence } from '../geofence/entities/geofence.entity';
import { Farm } from '../farms/entities/farm.entity';
import { Organization } from '../users/entities/organization.entity';
import { UserDDS } from '../users/entities/dds_user.entity';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { Species } from './entities/species.entity';
@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailModule,
    JobModule,
    SequelizeModule.forFeature([Job, Geofence, Farm,  Organization, UserDDS, DiligenceReport, DueDiligenceProductionPlace, Species])   
  ],
  controllers: [EmailSchedulerController],
  providers: [EmailSchedulerService],
  exports: [EmailSchedulerService]
})
export class EmailSchedulerModule {} 