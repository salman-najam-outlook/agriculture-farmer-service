import { Resolver, Query, Context } from '@nestjs/graphql';
import { RiskAssessmentCriteria } from '../entities/risk-assessment-criteria.entity';
import { RiskAssessmentCriteriaService } from '../services/risk-assessment-criteria.service';
import { TranslationService } from 'src/translation/translation.service';

@Resolver(() => RiskAssessmentCriteria)
export class RiskAssessmentCriteriaResolver {
    constructor(
        private readonly riskAssessmentCriteriaService: RiskAssessmentCriteriaService,
        private readonly translationService: TranslationService,
    ) {}

    @Query(() => [RiskAssessmentCriteria], { name: 'fetchAllRiskAssessmentCriteria' })
    async fetchAllRiskAssessmentCriteria(
        @Context() context: any,
    ): Promise<RiskAssessmentCriteria[]> {
            const riskAssessmentCriteria = await this.riskAssessmentCriteriaService.findAll();
           
            const translatedData = await this.translationService.translateObject(
                riskAssessmentCriteria,  
               context,
                ['id', 'createdAt', 'updatedAt', 'deletedAt'], 
            );
            return translatedData;
    }
}
