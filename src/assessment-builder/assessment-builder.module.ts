import { Module } from "@nestjs/common";
import { AssessmentBuilderService } from "./assessment-builder.service";
import { AssessmentBuilderResolver } from "./assessment-builder.resolver";
import { SequelizeModule } from "@nestjs/sequelize";

import { Sequelize } from "sequelize-typescript";
import { AssessmentQuestionResolver } from "./assessment-question.resolver";
import { AssessmentQuestionService } from "./assessment-question.service";

import { AssessmentQuestionHeadingService } from "./assessment-question-heading.service";
import { AssessmentQuestionHeadingResolver } from "./assessment-question-heading.resolver";
import { ASSESSMENT_MODELS } from "./constatns/models";
import { AssessmentSurveyResolver } from "./assessment-response.resolver";
import { AssessmentSurveyService } from "./assessment-response.service";
import { AssessmentUploadResolver } from "./assessment-upload.resolver";
import { AssessmentUploadService } from "./assessment-upload.service";
import { AssessmentBuilderController } from "./assessment-builder.controller";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { AssessmentBuilderMobileController } from "./assessment-builder.mobile.controller";
import { AssessmentBuilderMobileService } from "./assessment-builder.mobile.service";
import { FarmsService } from "src/farms/farms.service";
import { FarmsModule } from "src/farms/farms.module";
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DiligenceReportAssessmentUpload } from 'src/diligence-report/entities/diligence-report-assessment-upload.entity';
import { DiligenceReportAssessmentSurveys } from 'src/diligence-report/entities/diligence-report-assessment-survey.entity';
import { DiligenceReportAssessmentResponse } from 'src/diligence-report/entities/diligence-report-assessment-response.entity';

@Module({
  imports: [
    FarmsModule,
    SequelizeModule.forFeature([
      ...ASSESSMENT_MODELS,
      DueDiligenceProductionPlace,
      DiligenceReportProductionPlace,
      DiligenceReportAssessmentUpload,
      DiligenceReportAssessmentSurveys,
      DiligenceReportAssessmentResponse,
    ]),
  ],
  providers: [
    { provide: "SEQUELIZE", useExisting: Sequelize },
    AssessmentBuilderResolver,
    AssessmentBuilderService,
    AssessmentQuestionResolver,
    AssessmentQuestionService,
    AssessmentQuestionHeadingResolver,
    AssessmentQuestionHeadingService,
    AssessmentSurveyResolver,
    AssessmentSurveyService,
    AssessmentUploadResolver,
    AssessmentUploadService,
    AssessmentBuilderMobileService,
    FarmsService
  ],
  controllers: [
    AssessmentBuilderController, 
    AssessmentBuilderMobileController
  ]
})
export class AssessmentBuilderModule {}
