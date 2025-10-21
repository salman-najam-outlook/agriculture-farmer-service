import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import { CreateAssessmentQuestionInput, CreateAssessmentQuestionOutput } from "./create-assessment-question.input";
import { AssessmentResponseObject, QuestionDetail } from "./create-assessment-response.input";

@InputType()
export class AssessmentQuestionOptionsInput {

  @Field(() => String, { nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  value: string;

  @Field(() => [String], { nullable: true })
  checklists: string[];

  @Type(() => CreateAssessmentQuestionInput)
  @Field(() => [CreateAssessmentQuestionInput], { nullable: true })
  subQuestions: CreateAssessmentQuestionInput[];

}

@ObjectType()
export class AssessmentQuestionOptionsOutput {

  @Field(() => String, { nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  value: string;

  @Field(() => [String], { nullable: true })
  checklists: string[];

  @Type(() => CreateAssessmentQuestionOutput)
  @Field(() => [CreateAssessmentQuestionOutput], { nullable: true })
  subQuestions: CreateAssessmentQuestionOutput[];

}

@InputType("QuestionDetailOptionsInput")
@ObjectType("QuestionDetailOptionsOutput")
export class QuestionDetailOptions {
  @Field(() => Int, { nullable: false })
  id: number;

  @Field(() => String, { nullable: true })
  label: string;

  @Field(() => String, { nullable: true })
  value: string;

  @Field(() => [String], { nullable: true })
  checklists: string[];

  @Type(() => QuestionDetail)
  @Field(() => [QuestionDetail], { nullable: true })
  subQuestions: QuestionDetail[];

}


@InputType("SelectedOptionObjectInput")
@ObjectType("SelectedOptionObjectOutput")
export class SelectedOptionObject{
  @Field(() => Int, { nullable: false })
  selectedOptionId: number;

  @Field(() => String, { nullable: true })
  optionValue: string;

  @Field(() => [AssessmentResponseObject], { nullable: true })
  @Type(() => AssessmentResponseObject)
  subQuestionAnswerDetail: AssessmentResponseObject[];
}
