import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AssessmentSummary {
    @Field(() => Int)
    totalNoOfFarms: number;

    @Field(() => Int)
    assessmentsCompleted: number;

    @Field(() => Int)
    assessmentsPending: number;

    @Field(() => Int)
    requiredMitigation: number;
}