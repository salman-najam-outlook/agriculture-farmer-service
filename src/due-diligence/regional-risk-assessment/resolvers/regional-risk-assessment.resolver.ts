import { Args, Int, Mutation, Query, Resolver,Context } from "@nestjs/graphql";
import { RegionalRiskAssessment } from "../entities/regional-risk-assessment.entity";
import { RegionalRiskAssessmentService } from "../services/regional-risk-assessment.service";
import { CreateRegionalRiskAssessmentInput, EnhancedRegionalRiskAssessmentResponse, RegionalRiskAssessmentFilterInput, RegionalRiskAssessmentResponse, UpdateRegionalRiskAssessmentInput } from "../dto/regional-risk-assessment.dto";
import { TranslationService } from 'src/translation/translation.service';

@Resolver(() => RegionalRiskAssessment)
export class RegionalRiskAssessmentResolver {
  constructor(private readonly regionalRiskAssessmentService: RegionalRiskAssessmentService,
    private readonly translationService: TranslationService,

  ) {}

  @Query(() => RegionalRiskAssessmentResponse, { name: 'getAllRegionalRiskAssessments' })
async getAllRegionalRiskAssessments(
  @Context() context: any,
  @Args('filter', { nullable: false }) filter: RegionalRiskAssessmentFilterInput
): Promise<RegionalRiskAssessmentResponse> {
    const result = await this.regionalRiskAssessmentService.findAll(filter);
    const rows = result.rows;
    const translatedRows = await this.translationService.translateObject(rows, context, ['id'])
    return {
      ...result,
      rows: translatedRows,
    };
}


  @Query(() => EnhancedRegionalRiskAssessmentResponse, { name: 'getRegionalRiskAssessmentById' })
  async getRegionalRiskAssessmentById(
    @Context() context: any,
    @Args('id', { type: () => Int }) id: number,
  ): Promise<EnhancedRegionalRiskAssessmentResponse> {
    const result = await this.regionalRiskAssessmentService.findOne(id);
    console.log('result', result);
    const rows = result.riskCriteriaIdWithLevels;
    const translatedResult = await this.translationService.translateObject(rows,context, ['id','country']);
    return {
      ...result,
      riskCriteriaIdWithLevels: translatedResult,
    };
  }

  @Mutation(() => RegionalRiskAssessment, { name: 'createRegionalRiskAssessment' })
  async createRegionalRiskAssessment(
      @Args('data') data: CreateRegionalRiskAssessmentInput
  ): Promise<RegionalRiskAssessment> {
    return this.regionalRiskAssessmentService.create(data);
  }

  @Mutation(() => RegionalRiskAssessment, { name: 'updateRegionalRiskAssessment' })
  async updateRegionalRiskAssessment(
    @Args('data') data: UpdateRegionalRiskAssessmentInput,
  ): Promise<RegionalRiskAssessment> {
    return this.regionalRiskAssessmentService.update(data);
  }

  @Mutation(() => Boolean, { name: 'deleteRegionalRiskAssessment' })
  async deleteRegionalRiskAssessment(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
    await this.regionalRiskAssessmentService.delete(id);
    return true;
  }
}
