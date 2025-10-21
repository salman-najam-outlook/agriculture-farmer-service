import { forwardRef, Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from 'src/mail/mail.module';
import { UsersModule } from 'src/users/users.module';

import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { UsersService } from 'src/users/users.service';
import { DiligenceReportResolver } from './diligence-report.resolver';
import { DiligenceReportService } from './diligence-report.service';
import { DiligenceReport } from './entities/diligence-report.entity';
import {DiligenceActivityLog} from "./entities/diligence-activity-log.entity";
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { ProductionPlaceDisputes } from 'src/due-diligence/production-place/entities/production-place-dispute.entity';
import { RiskMitigationFiles } from 'src/due-diligence/production-place/entities/risk-mitigation-files.entity'


import { ProductionPlaceDisputeComments } from 'src/due-diligence/production-place/entities/dispute-comment.entity'
import { DiligenceReportAssessment } from './entities/diligence-report-assessment.entity';
import { Assessment } from 'src/assessment-builder/entities/assessment.entity';
import { RequestAdditionalInformation } from './entities/diligence-report-request-additional-request.entity';
import { DiligenceReportController } from './diligence-report.controller'
import { EudrSetting } from "src/eudr-settings/entities/eudr-setting.entity"
import { UserDDS } from "src/users/entities/dds_user.entity";
import { JobModule } from 'src/job/job.module';
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';
import { DiligenceReportTransaction } from './entities/diligence-report-transaction.entity';
import { UserMetadata } from 'src/metadata/entities/user_metadata.entity';
import { Organization } from 'src/users/entities/organization.entity';
import { MetadataModule } from 'src/metadata/metadata.module';
import { TranslationService } from 'src/translation/translation.service';
import { TranslationModule } from 'src/translation/translation.module';
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { DiligenceReportProductionPlace } from './entities/diligence-report-production-place.entity';
import { DdsReportExporter } from './entities/dds-report-exporter.entity';
import { TemporaryApprovalCronService } from './temporary-approval-cron.service';
import { ApprovalFlowSettingsService } from '../due-diligence/approval-flow-setting/approval-flow-settings.service';
import { ApprovalFlowSetting } from 'src/due-diligence/approval-flow-setting/entities/approval-flow-settings.entity';
import { Shipment } from '../shipment/entities/shipment.entity';
import { Farm } from '../farms/entities/farm.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MailModule,
    UsersModule,
    MetadataModule,
    TranslationModule,
    SequelizeModule.forFeature([
     DiligenceReport,
     EudrSetting,
     DiligenceActivityLog,
     DueDiligenceProductionPlace,
     ProductionPlaceDisputes,
     RiskMitigationFiles,
     ProductionPlaceDisputeComments,
     DiligenceReportAssessment,
     Assessment,
     RequestAdditionalInformation,
     UserDDS,
     DeforestationReportRequest,
     DiligenceReportTransaction,
     UserMetadata,
     Organization,
     ProductionPlaceDeforestationInfo,
     DiligenceReportProductionPlace,
     DdsReportExporter,
     ApprovalFlowSetting,
     Shipment,
     Farm
     // User
    ]),
    forwardRef(() => JobModule),
  ],
  providers: [
    DiligenceReportResolver,
    DiligenceReportService,
    TemporaryApprovalCronService,
    ApprovalFlowSettingsService,
   // UsersService,
    { provide: 'SEQUELIZE', useExisting: Sequelize },

  ],
  exports: [SequelizeModule, DiligenceReportService],
  controllers: [DiligenceReportController],
})
export class DiligenceReportModule { }