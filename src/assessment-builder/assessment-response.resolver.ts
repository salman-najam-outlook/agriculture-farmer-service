import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { AssessmentSurveyService } from "./assessment-response.service";
import { CreateSurveyResponseInput } from "./dto/create-assessment-response.input";
import { AssessmentSurvey, SurveyStatus } from "./entities/assessment-survey.entity";

@Resolver(() => AssessmentSurvey)
export class AssessmentSurveyResolver {
  constructor(
    private readonly assessmentSurveyService: AssessmentSurveyService
  ) {}

  @Mutation(() => AssessmentSurvey)
  async saveSurveyResponse(
    @Args("createSurveyResponseInput")
    createSurveyResponseInput: CreateSurveyResponseInput
  ) {
    return this.assessmentSurveyService.saveResponse(
      createSurveyResponseInput
    );
  }

  @Query(() => AssessmentSurvey, {
    name: "findAllSurveyResponse",
    nullable: true,
  })
  async findAllSurveyResponse(
    @Args("assessmentId", { type: () => Int }) assessmentId: number,
    @Args("dueDiligenceId", { type: () => Int, nullable: true }) dueDiligenceId: number,
    @Args("farmId", { type: () => Int, nullable: true }) farmId: number,
    @Args("userId", { type: () => Int, nullable: true }) userId: number,
  ) {

    return this.assessmentSurveyService.findAllResponse(
      assessmentId,
      dueDiligenceId,
      farmId,
      userId
    );
  }

  @Query(() => AssessmentSurvey, {
    name: "findOne",
  })
  async findOne(@Args("id", { type: () => Int }) id: number) {
    return this.assessmentSurveyService.findOne(id);
  }
}
