import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { AssessmentQuestionHeading } from "./entities/assessment-question-headings.entity";
import { AssessmentQuestionHeadingService } from "./assessment-question-heading.service";
import { CreateAssessmentQuestionHeadingInput } from "./dto/create-assessment-question-heading.input";

@Resolver(() => AssessmentQuestionHeading)
export class AssessmentQuestionHeadingResolver {
  constructor(
    private readonly assessmentQuestionHeadingService: AssessmentQuestionHeadingService
  ) { }

  @Mutation(() => AssessmentQuestionHeading)
  async createQuestionHeading(
    @Args("createAssessmentQuestionHeadingInput")
    createAssessmentQuestionHeadingInput: CreateAssessmentQuestionHeadingInput
  ) {
    return this.assessmentQuestionHeadingService.create(
      createAssessmentQuestionHeadingInput
    );
  }

  @Mutation(() => Boolean)
  async removeAssessmentHeading(@Args("id", { type: () => Int }) id: number) {
    return this.assessmentQuestionHeadingService.remove(id);
  }

  @Query(() => [AssessmentQuestionHeading], {
    name: "getAssessmentHeadingList",
  })
  async getAssessmentHeadingList(
    @Args("assessmentId", { type: () => Int, nullable: false })
    assessmentId: number,
    @Args("search", { type: () => String, nullable: true })
    search: string
  ) {
    return this.assessmentQuestionHeadingService.getHeadingOfAssessment(
      assessmentId,
      search
    );
  }

  @Query(() => AssessmentQuestionHeading, { name: "getHeadingDetail" })
  async getHeadingDetail(
    @Args("headingId", { type: () => Int, nullable: false }) headingId: number
  ) {
    return this.assessmentQuestionHeadingService.findOne(headingId);
  }

  @Mutation(() => AssessmentQuestionHeading, { name: "updateHeading" })
  async updateHeading(
    @Args("headingId", { type: () => Int, nullable: false }) headingId: number,
    @Args("assessmentHeadingTitle", { type: () => String, nullable: false })
    assessmentHeadingTitle: string
  ) {
    return this.assessmentQuestionHeadingService.update(
      headingId,
      assessmentHeadingTitle
    );
  }

  @Mutation(() => Boolean, {
    name: "reorderHeading",
  })
  async reorderHeading(
    @Args("assessmentId", { type: () => Int }) assessmentId: number,
    @Args("headingId", { type: () => Int }) headingId: number,
    @Args("newOrder", { type: () => Int }) newOrder: number,
  ) {
    return this.assessmentQuestionHeadingService.reorderHeading(assessmentId, headingId, newOrder);
  }
}
