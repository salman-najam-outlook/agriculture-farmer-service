import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Assessment } from "../entities/assessment.entity";

@ObjectType()
export class AssessmentListPaginatedResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [Assessment], { nullable: true })
  rows: Assessment[];
}
