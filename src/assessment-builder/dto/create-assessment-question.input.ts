import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { AssessmentQuestionType } from "./AssessmentQuestionType";
import { FileTypeAdditionalSettings } from "./FileTypeAdditionalSettings";
import { Type } from "class-transformer";
import { AssessmentQuestionOptionsInput, AssessmentQuestionOptionsOutput } from "./create-assessment-option.input";
import { IsInt, IsOptional, IsString } from "class-validator";
import { DigitalSignatureTypeAdditionalSettings } from "./DigitalSignatureTypeAdditionalSettings";

@InputType()
export class CreateAssessmentQuestionInput {
  @Field(() => Int, { nullable: false })
  assessmentId: number;

  @Field(() => Int, { nullable: true })
  headingId: number;

  order: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => AssessmentQuestionType, { nullable: false })
  assessmentQuestionType: AssessmentQuestionType;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isMandatory: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isEnabled: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  hasOptions: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isFileType: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isDigitalSignatureType: boolean;

  @Field(() => FileTypeAdditionalSettings, { nullable: true })
  fileTypeAdditionalSettings: FileTypeAdditionalSettings;

  @Field(() => DigitalSignatureTypeAdditionalSettings, { nullable: true })
  digitalSignatureTypeAdditionalSettings: DigitalSignatureTypeAdditionalSettings

  @Field(() => [AssessmentQuestionOptionsInput], { nullable: true })
  @Type(()=>AssessmentQuestionOptionsInput)
  options: AssessmentQuestionOptionsInput[]

}

@ObjectType()
export class CreateAssessmentQuestionOutput {
  @Field(() => Int, { nullable: false })
  id: number;

  @Field(() => Int, { nullable: false })
  assessmentId: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => AssessmentQuestionType, { nullable: false })
  assessmentQuestionType: AssessmentQuestionType;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isMandatory: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isEnabled: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  hasOptions: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isFileType: boolean;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isDigitalSignatureType: boolean;

  @Field(() => FileTypeAdditionalSettings, { nullable: true })
  fileTypeAdditionalSettings: FileTypeAdditionalSettings;

  @Field(() => DigitalSignatureTypeAdditionalSettings, { nullable: true })
  digitalSignatureTypeAdditionalSettings: DigitalSignatureTypeAdditionalSettings

  @Field(() => [AssessmentQuestionOptionsOutput], { nullable: true })
  @Type(()=>AssessmentQuestionOptionsOutput)
  options: AssessmentQuestionOptionsOutput[]

}
@InputType()
export class GetAllQuestionListInput  {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsInt()
  @Field(() => Int, { nullable: false })
  assessmentId: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  search?: string;

}