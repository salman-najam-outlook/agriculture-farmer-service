import { Module } from '@nestjs/common';
import { AssessmentMitigationService } from './assessment-mitigation.service';
import { AssessmentMitigationResolver } from './assessment-mitigation.resolver';
import { Sequelize } from "sequelize-typescript";
import { SequelizeModule } from "@nestjs/sequelize";
import { ASSESSMENT_MITIGATION_MODELS } from './constants/models';
import { AssessmentMitigationMobileController } from './assessment-mitigation.mobile.controller';
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';

@Module({
  imports:[
    SequelizeModule.forFeature([
      ...ASSESSMENT_MITIGATION_MODELS,
      DiligenceReportProductionPlace,
    ]),
  ],
    
  providers: [
    {
      provide: "SEQUELIZE", 
      useExisting: Sequelize 
    },
    AssessmentMitigationResolver, 
    AssessmentMitigationService,
  ],
  controllers: [
    AssessmentMitigationMobileController
  ]
})
export class AssessmentMitigationModule {}
