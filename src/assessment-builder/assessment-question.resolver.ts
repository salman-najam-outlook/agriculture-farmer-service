import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { AssessmentQuestions } from "./entities/assessment-questions.entity";
import { AssessmentQuestionService } from "./assessment-question.service";
import {
  CreateAssessmentQuestionInput,
  GetAllQuestionListInput,
} from "./dto/create-assessment-question.input";
import { AssessmentQuestionListPaginatedForSurvey, AssessmentQuestionListPaginatedHeadingResponse, AssessmentQuestionListPaginatedResponse } from "./dto/assessment-question.output";
import { Logger } from "@nestjs/common";

@Resolver(() => AssessmentQuestions)
export class AssessmentQuestionResolver {
  constructor(
    private readonly assessmentQuestionService: AssessmentQuestionService
  ) { }

  @Mutation(() => AssessmentQuestions)
  async createNewAssessmentQuestions(
    @Args("createAssessmentQuestionInput")
    createAssessmentQuestionInput: CreateAssessmentQuestionInput
  ) {
    return await this.assessmentQuestionService.create(createAssessmentQuestionInput);
  }

  @Mutation(() => AssessmentQuestions, { name: "updateAssessmentQuestion" })
  async updateAssessmentQuestion(
    @Args("id", { type: () => Int }) id: number,
    @Args("createAssessmentQuestionInput")
    CreateAssessmentQuestionInput: CreateAssessmentQuestionInput
  ) {
    const basicQuestionDetail = await this.assessmentQuestionService.getBasicQuestionDetail(id);
    if(!basicQuestionDetail){
      throw new Error("Question Not found")
    }

    let headingId = basicQuestionDetail.headingId;
    let order = basicQuestionDetail.order;
    if( CreateAssessmentQuestionInput.headingId && basicQuestionDetail.headingId !== CreateAssessmentQuestionInput.headingId){
      headingId = CreateAssessmentQuestionInput.headingId;
      order = 0
    }

    // Deleting and recreating a question    
    if (!await (this.assessmentQuestionService.remove(id , (CreateAssessmentQuestionInput.headingId && basicQuestionDetail.headingId !== CreateAssessmentQuestionInput.headingId)))) {
      throw new Error("Failed to update assessment!")
    }

    return await this.assessmentQuestionService.create({...CreateAssessmentQuestionInput, headingId, order});
  }

  //returns question detail with nested question for question detail view
  @Query(() => AssessmentQuestions, { name: "findQuestionDetail" })
  async findQuestionDetail(
    @Args("assessmentId", { type: () => Int }) assessmentId: number,
    @Args("questionId", { type: () => Int }) questionId: number
  ) {
    const question = await this.assessmentQuestionService.findQuestionsDetail(
      assessmentId,
      questionId
    );
    return question[0];
  }


  //return question list for assessment multi-step type QUESTION
  @Query(() => AssessmentQuestionListPaginatedResponse, {
    name: "findAllQuestionsOfAssessment",
  })
  async findAllQuestionsOfAssessment(
    @Args("getAllQuestionListInput")
    getAllQuestionListInput: GetAllQuestionListInput
  ) {
    return this.assessmentQuestionService.findAllQuestionsOfAssessment(
      getAllQuestionListInput
    );
  }


  //return question list for assessment multi-step type HEADINGS
  @Query(() => AssessmentQuestionListPaginatedHeadingResponse, {
    name: "findAllQuestionsOfAssessmentByHeading",
  })
  async findAllQuestionsOfAssessmentByHeading(
    @Args("getAllQuestionListInput")
    getAllQuestionListInput: GetAllQuestionListInput
  ) {
    return this.assessmentQuestionService.findAllQuestionsOfAssessmentByHeading(
      getAllQuestionListInput
    );
  }

  @Query(() => AssessmentQuestionListPaginatedHeadingResponse, {
    name: "findAllQuestionsOfAssessmentByHeadingId",
  })
  async findAllQuestionsOfAssessmentByHeadingId(
    @Args("assessmentId", { type: () => Int }) assessmentId: number,
    @Args("headingId", { type: () => Int }) headingId: number,
  ) {
    return this.assessmentQuestionService.findAllQuestionsOfAssessmentByHeadingId(
      assessmentId,
      headingId
    );
  }



  @Query(() => AssessmentQuestionListPaginatedForSurvey, {
    name: "findQuestionForSurvey",
  })
  async findQuestionForSurvey(
    @Args("assessmentId", { type: () => Int }) assessmentId: number
  ) {
    return this.assessmentQuestionService.findQuestionForAssessment(assessmentId);
  }



  @Mutation(() => Boolean, {
    name: "reorderQuestion",
  })
  async reorderHeading(
    @Args("assessmentId", { type: () => Int }) assessmentId: number,
    @Args("questionId", { type: () => Int }) questionId: number,
    @Args("newOrder", { type: () => Int }) newOrder: number,
  ) {
    return this.assessmentQuestionService.reorderQuestion(assessmentId, questionId, newOrder);
  }


  @Mutation(() => Boolean, {
    name: "removeAssessmentQuestion",
  })
  async removeAssessment(
    @Args("id", { type: () => Int }) id: number
  ) {
    return this.assessmentQuestionService.remove(id, true);
  }

}
