import { Field, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateAssessmentQuestionHeadingInput {
  @Field(() => Int, { nullable: false })
  assessmentId: number;

  // @Field(() => Int, { nullable: true })
  // headingId: number;

  // @Field(() => Int, { nullable: true , defaultValue: 0})
  // order: number;

  @Field(() => String, { nullable: true })
  title: string;

}