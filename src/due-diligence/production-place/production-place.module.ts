import { forwardRef, Module } from "@nestjs/common";
import { ProductionPlaceService } from "./production-place.service";
import { ProductionPlaceResolver } from "./production-place.resolver";
import { FarmsModule } from "src/farms/farms.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { Farm } from "src/farms/entities/farm.entity";
import { FarmUploadHistory } from "src/farms/entities/farm-upload-history.entity";
import { Sequelize } from "sequelize-typescript";
import { DueDiligenceProductionPlace } from "./entities/production-place.entity";
import { FarmCoordinates } from "src/farms/entities/farmCoordinates.entity";
import { GeofenceModule } from "src/geofence/geofence.module";
import { UsersModule } from "src/users/users.module";
import { FarmLocation } from "src/farms/entities/farmLocation.entity";
import { RiskMitigationFiles } from "./entities/risk-mitigation-files.entity";
import { ProductionPlaceController } from './production-place.controller';
import {ProductionPlaceDisputeComments} from "./entities/dispute-comment.entity";
import {ProductionPlaceDisputes} from "./entities/production-place-dispute.entity";
import { DiligenceReport } from "src/diligence-report/entities/diligence-report.entity";
import { UserDDS } from "src/users/entities/dds_user.entity";
import { JobModule } from 'src/job/job.module';
import { MessageQueueingModule } from "src/message-queueing/message-queueing.module";
import { EudrSetting } from "src/eudr-settings/entities/eudr-setting.entity";
import { AssessmentProductionPlace } from "src/assessment-builder/entities/assessment-production-place.entity";
import { ProductionPlaceWarningService } from "src/due-diligence/production-place/production-place-warning.service"
import { ProductionPlaceDeforestationInfo } from './entities/production-place-deforestation-info.entity';
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DiligenceReportAssessmentSurveys } from 'src/diligence-report/entities/diligence-report-assessment-survey.entity';
import { DiligenceReportPlaceMitigationFile } from 'src/diligence-report/entities/diligence-report-mitigation-file.entity';
import { AssessmentUploads } from 'src/assessment-builder/entities/assessment-uploads.entity';
import { AssessmentSurvey } from 'src/assessment-builder/entities/assessment-survey.entity';
import { ReportPlaceAssessmentProductionPlace } from 'src/diligence-report/entities/diligence-report-place-assessment-production-place.entity';
import { DiligenceReportAssessment } from 'src/diligence-report/entities/diligence-report-assessment.entity';
import { TranslationService } from "src/translation/translation.service";
import { Translation } from "src/translation/translation.entity";
import { DueDiligenceProductionManuallyMitigated } from "./entities/due-diligence-production-manually-mitigated.entity";
import { DueDiligenceProductionPlacesPyData } from "src/deforestation/entities/due_diligence_production_places_py_data.entity";
import { S3Service as s3Service} from '../blend/blend-settings/utils/s3upload';

@Module({
  imports: [
    FarmsModule,
    GeofenceModule,
    UsersModule,
    MessageQueueingModule,
    SequelizeModule.forFeature([
      UserDDS,
      Farm,
      FarmCoordinates,
      FarmLocation,
      DueDiligenceProductionPlace,
      RiskMitigationFiles,
      ProductionPlaceDisputes,
      ProductionPlaceDisputeComments,
      FarmUploadHistory,
      DiligenceReport,
      EudrSetting,
      AssessmentProductionPlace,
      ProductionPlaceDeforestationInfo,
      DiligenceReportProductionPlace,
      DiligenceReportAssessmentSurveys,
      DiligenceReportPlaceMitigationFile,
      AssessmentUploads,
      AssessmentSurvey,
      ReportPlaceAssessmentProductionPlace,
      DiligenceReportAssessment,
      Translation,
      DueDiligenceProductionManuallyMitigated,
      DueDiligenceProductionPlacesPyData
    ]),
    forwardRef(() => JobModule),
  ],
  providers: [
    ProductionPlaceService,
    s3Service,
    ProductionPlaceWarningService,
    TranslationService,
    ProductionPlaceResolver,
    { provide: "SEQUELIZE", useExisting: Sequelize },
  ],
  controllers: [ProductionPlaceController],
  exports: [ProductionPlaceService,ProductionPlaceWarningService, TranslationService],
})
export class ProductionPlaceModule {}
