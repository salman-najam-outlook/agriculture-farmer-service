import {Field, InputType, Int, ObjectType} from "@nestjs/graphql";
import { AssessmentUploads } from "../entities/assessment-uploads.entity";

@InputType()
export class FileDetailInput {
    @Field(() => Int, {nullable: true})
    id: number;

    @Field(() => String, {nullable: false})
    s3Key: string;

    @Field(() => String, {nullable: false})
    s3Location: string;

    @Field(() => String, {nullable: true})
    comment: string;

    @Field(() => Date, {nullable: true})
    expiry_date: string;
}

@InputType()
export class CreateAssessmentUploadInput {
    @Field(() => Int, {nullable: false})
    assessment_id: number;

    @Field(() => Int, {nullable: false})
    diligence_report_id: number;

    @Field(() => Int, {nullable: true})
    production_place_id: number;

    @Field(() => [FileDetailInput], {nullable: false})
    fileDetails: FileDetailInput[];
}

@ObjectType()
export class AssessmentUploadResponse {
    @Field()
    message: string;

    @Field(() => Boolean)
    status: boolean;
}



@ObjectType()
export class UploadResponse {
    @Field(() => Int, { nullable: true })
    count: number;
  
    @Field(() => Int, { nullable: true })
    totalCount: number;
  
    @Field(() => [AssessmentUploads], { nullable: true })
    rows: AssessmentUploads[];
}
