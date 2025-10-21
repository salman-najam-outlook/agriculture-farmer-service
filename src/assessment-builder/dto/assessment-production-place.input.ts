import {Field, InputType, Int, ObjectType} from "@nestjs/graphql";
import { AssessmentUploads } from "../entities/assessment-uploads.entity";


@InputType()
export class CreateAssessmentProductionPlaceInput {
    @Field(() => Int, {nullable: false})
    assessmentId: number;

    @Field(() => Int, {nullable: false})
    productionPlaceId: number;

    @Field(() => Int, {nullable: false})
    assessmentResponseId: number;

    @Field(() => Int, {nullable: false})
    diligenceReportId: number;

    @Field(() => String, {nullable: true})
    riskAssessmentStatus: string;

    @Field(() => String, {nullable: false})
    s3Key: string;

    @Field(() => String, {nullable: false})
    s3Location: string;

    @Field(() => String, {nullable: true})
    comment: string;

    @Field(() => Date, {nullable: true})
    expiry_date: string;
}

@ObjectType()
export class AssessmentUploadResponse {
    @Field()
    message: string;

    @Field(() => [AssessmentUploads])
    uploads: AssessmentUploads[];
}
