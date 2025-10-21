import { Field, Int, ObjectType } from "@nestjs/graphql";
import { AssessmentQuestions } from "../entities/assessment-questions.entity";
import { AssessmentQuestionHeading } from "../entities/assessment-question-headings.entity";

@ObjectType()
export class AssessmentQuestionListPaginatedResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [AssessmentQuestions], { nullable: true })
  rows: AssessmentQuestions[];
}


@ObjectType()
export class AssessmentQuestionListPaginatedHeadingResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [AssessmentQuestionHeading], { nullable: true })
  rows: AssessmentQuestionHeading[];
}

@ObjectType()
export class SurveyQuestionRows{
  @Field(() => String, { nullable: true })
  title: number;

  @Field(() => [AssessmentQuestions], { nullable: true })
  assessmentQuestions: AssessmentQuestions[];
}

@ObjectType()
export class AssessmentQuestionListPaginatedForSurvey {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [SurveyQuestionRows], { nullable: true })
  rows: SurveyQuestionRows[];
}