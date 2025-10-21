import { Field, Float, InputType, Int, ObjectType } from "@nestjs/graphql";
import { AssessmentQuestionType } from "./AssessmentQuestionType";
import { FileTypeAdditionalSettings } from "./FileTypeAdditionalSettings";
import { DigitalSignatureTypeAdditionalSettings } from "./DigitalSignatureTypeAdditionalSettings";
import { Type } from "class-transformer";
import {
  QuestionDetailOptions,
  SelectedOptionObject,
} from "./create-assessment-option.input";
import { SurveyStatus } from "../entities/assessment-survey.entity";

@InputType("FileAndDigitalSignatureFieldAnswer")
@ObjectType("FileAndDigitalSignatureFieldAnswerOutput")
export class FileAndDigitalSignatureFieldAnswer {
  @Field(() => String, { nullable: true })
  attachmentLink: string;

  @Field(() => String, { nullable: true })
  s3key: string;

  @Field(() => String, { nullable: true })
  comment: string;

  @Field(()=>String, { nullable:true })
  signatureOwner: string;

  @Field(()=>Date, { nullable:true })
  createdAt: Date;
}

@InputType("QuestionDetailInput")
@ObjectType("QuestionDetailOutput")
export class QuestionDetail {
  @Field(() => Int, { nullable: true })
  id: string;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: false })
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

  @Field(() => DigitalSignatureTypeAdditionalSettings, {
    nullable: true,
  })
  digitalSignatureTypeAdditionalSettings: DigitalSignatureTypeAdditionalSettings;

  @Field(() => [QuestionDetailOptions], { nullable: true })
  @Type(() => QuestionDetailOptions)
  options: QuestionDetailOptions[];
}

@InputType("AssessmentResponseInput", {})
@ObjectType("AssessmentResponseOutput", {})
export class AssessmentResponseObject {
  @Field(() => Int, { nullable: false })
  questionId: number;

  @Field(() => String, { nullable: false })
  assessmentQuestionType: AssessmentQuestionType;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  questionHasOptions: boolean;

  //for text fields
  @Field(() => String, {
    nullable: true,
  })
  textFieldAnswer: string;

  //for number fields
  @Field(() => Float, {
    nullable: true
  })
  numberFieldAnswer: number;

  //for file fields
  @Field(() => [FileAndDigitalSignatureFieldAnswer], {
    nullable: true,
  })
  fileAndDigitalSignatureFieldAnswer: FileAndDigitalSignatureFieldAnswer[];

  @Field(() => [SelectedOptionObject], {
    nullable: true,
  })
  selectedOptions: SelectedOptionObject[];
}

@InputType()
export class SurveyResponses {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => Int, { nullable: false })
  questionId: number;

  @Field(() => QuestionDetail, { nullable: true })
  @Type(() => QuestionDetail)
  questionDetail: QuestionDetail;

  @Field(() => AssessmentResponseObject)
  response: AssessmentResponseObject;
}

@InputType()
export class SignatureDetails {
  @Field(()=>String, { nullable:true })
  signatureS3Key: string;

  @Field(()=>String, { nullable:true })
  signatureS3Location: string;

  @Field(()=>String, { nullable:true })
  signatureOwner: string;

  @Field(()=>Date, { nullable:true })
  createdAt: Date;
}

@InputType()
export class CreateSurveyResponseInput {
  @Field(() => Int, { nullable: true })
  dueDiligenceId: number;

  @Field(() => Int, { nullable: false })
  assessmentId: number;

  @Field(() => Int, { nullable: false })
  userId: number;

  @Field(() => Int, { nullable: true })
  submittedBy: number;

  @Field(() => SurveyStatus, { nullable: true })
  status: SurveyStatus;

  @Field(() => Int, { nullable: true, description: "Farm" })
  cfFarmId: number;

  @Field(() => Int, { nullable: true })
  userFarmId: number;

  @Field(()=>SignatureDetails, { nullable:true })
  signatureDetails: SignatureDetails;

  @Field(() => [SurveyResponses], { nullable: false })
  surveyResponses: SurveyResponses[];
}
