import { Resolver, Query, Mutation, Args, Int } from '@nestjs/graphql';
import { AssessmentBuilderService } from './assessment-builder.service';
import { Assessment } from './entities/assessment.entity';
import { AssessmentSummary } from './entities/assessment-summary.entity';
import { CreateAssessmentInput, GetAllAssessmentListInput } from './dto/create-assessment-builder.input';
import { UpdateAssessmentInput } from './dto/update-assessment-builder.input';
import { AssessmentListPaginatedResponse } from './dto/assessment-builder.output';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver(() => Assessment)
export class AssessmentBuilderResolver {
  constructor(private readonly assessmentBuilderService: AssessmentBuilderService) { }

  @Mutation(() => Assessment)
  async createNewAssessment(
    @Args("createAssessmentInput") createAssessmentInput: CreateAssessmentInput,
    @GetTokenData("authorization") authorization: string,
    @GetTokenData("organizationid") organizationId: number,
    @GetTokenData("subOrganizationId") subOrganizationId
  ) {
    return this.assessmentBuilderService.create(
      createAssessmentInput,
      authorization,
      organizationId,
      subOrganizationId
    );
  }

  @Mutation(() => [Assessment])
  async createFromDefaultAssessment(
    @Args('userId', { type: () => Int }) userId: number,
    @Args('orgId', { type: () => Int }) orgId: number,
    @GetTokenData("organizationid") organizationId: number,
    @GetTokenData("subOrganizationId") subOrganizationId,
    @Args('defaultAssessmentIds', { type: () => [Int] }) defaultAssessmentIds: number[]) {
    return this.assessmentBuilderService.createFromDefaultAssessment(userId, orgId, defaultAssessmentIds, organizationId, subOrganizationId);
  }

  @Query(() => AssessmentListPaginatedResponse, { name: 'findAllAssessmentList' })
  async findAllAssessmentList(
    @Args('getAllAssessmentListInput') getAllAssessmentListInput: GetAllAssessmentListInput,
    @GetTokenData("organizationid") organizationId: number,
    @GetTokenData("subOrganizationId") subOrganizationId
  ) {
    return this.assessmentBuilderService.findAllAssessmentList(getAllAssessmentListInput, organizationId, subOrganizationId);
  }

  @Query(() => [Assessment], { name: 'getAssessmentListOfOrganizationForDD' })
  async getAssessmentListOfOrganizationForDD(@Args('orgId', { type: () => Int, nullable: false }) orgId: number) {
    return this.assessmentBuilderService.getAssessmentListOfOrganizationForDD(orgId);
  }

  @Query(() => [Assessment], { name: 'getDefaultDimitraAssessments' })
  async getDefaultDimitraAssessments(@Args('countries', { type: () => [String], nullable: true }) countries?: string[]) {
    return this.assessmentBuilderService.getDefaultDimitraAssessments(countries);
  }

  @Query(() => Assessment, { name: 'assessmentDetail' })
  async findOne(@Args('id', { type: () => Int }) id: number) {
    return this.assessmentBuilderService.findOne(id);
  }

  @Mutation(() => Assessment)
  async updateAssessment(
    @Args("updateAssessmentInput") updateAssessmentInput: UpdateAssessmentInput,
    @GetTokenData("authorization") authorization: string
  ) {
    return this.assessmentBuilderService.update(
      updateAssessmentInput.id,
      updateAssessmentInput,
      authorization
    );
  }

  @Mutation(() => Boolean)
  async removeAssessment(@Args('id', { type: () => Int }) id: number) {
    return this.assessmentBuilderService.remove(id);
  }

  @Query(() => AssessmentSummary, { name: 'getAssessmentSummary' })
  async getAssessmentSummary(
    @Args('diligenceId', { type: () => Int ,  nullable: true}) diligenceId: number,
    @Args('assessmentId', { type: () => Int,  nullable: true }) assessmentId: number,
    @Args('farmsList', { type: () => [Int] }) farmsList: number[],
  ) {
    // TODO: Request Assessment ID as well and fix the frontend
    return this.assessmentBuilderService.getAssessmentSummary(diligenceId, assessmentId, farmsList);
  }
}