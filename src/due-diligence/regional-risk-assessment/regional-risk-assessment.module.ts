import { Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { RegionalRiskAssessment } from "./entities/regional-risk-assessment.entity";
import { RiskAssessmentCriteria } from "./entities/risk-assessment-criteria.entity";
import { RegionalRiskAssessmentResolver } from "./resolvers/regional-risk-assessment.resolver";
import { RiskAssessmentCriteriaResolver } from "./resolvers/risk-assessment-criteria.resolver";
import { RegionalRiskAssessmentService } from "./services/regional-risk-assessment.service";
import { RiskAssessmentCriteriaService } from "./services/risk-assessment-criteria.service";
import { TranslationService } from "src/translation/translation.service";
import { Translation } from "src/translation/translation.entity";
@Module({
  imports: [SequelizeModule.forFeature([RiskAssessmentCriteria, RegionalRiskAssessment, Translation])],
  providers: [RegionalRiskAssessmentResolver, RiskAssessmentCriteriaResolver, RegionalRiskAssessmentService, RiskAssessmentCriteriaService, TranslationService],
  controllers: [],
  exports: [RegionalRiskAssessmentService, RiskAssessmentCriteriaService,TranslationService],
})
export class RegionalRiskAssessmentModule {}