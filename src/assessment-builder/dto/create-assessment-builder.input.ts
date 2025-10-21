import { InputType, Int, Field } from '@nestjs/graphql';
import { AssessmentStatus } from './AssessmentStatus';
import { MultiStepAssessmentType } from './MultiStepAssessmentType';
import { AllowMultipleEntries } from './AllowMultipleEntries';
import { IsArray, IsInt, IsOptional, IsString, isInt } from 'class-validator';
import { AssessmentType } from './AssessmentType';

@InputType()
export class AssessmentSettings {
  @Field(() => Date, { nullable: true })
  expiryDate: string;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isScheduled: boolean;

  @Field(() => Date, { nullable: true })
  scheduleDate: string;

  @Field(() => Date, { nullable: true })
  scheduledEndDate: string;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isMultiStep: boolean;

  @Field(() => MultiStepAssessmentType, { nullable: true })
  multiStepType: MultiStepAssessmentType;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  noOfQuestion: number;

  // @Field(() => Int, { nullable: true, defaultValue: 0 })
  // noOfHeadings: number;

  @Field(() => AllowMultipleEntries, { nullable: true })
  allowMultipleEntries: AllowMultipleEntries;
}

@InputType()
export class CreateAssessmentInput {
  @Field(() => Int, { nullable: true })
  orgId: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => [String], { nullable: true })
  countries: string[];

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => AssessmentStatus, { nullable: false, defaultValue: AssessmentStatus.IN_ACTIVE })
  status: AssessmentStatus;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isApplicableToSelectedUsersOnly: boolean;

  @Field(() => [Int], { nullable: true })
  assessmentSelectedUsers: number[];

  @Field(() => AssessmentSettings, { nullable: true })
  assessmentSettings: AssessmentSettings

}

@InputType()
export class GetAllAssessmentListInput  {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  orgId?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  userId?: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  search?: string;

  @IsOptional()
  @IsArray()
  @Field(() => [String], { nullable: true })
  countries?: string[];

  @IsOptional()
  @IsString()
  @Field(() => AssessmentStatus, { nullable: true })
  status?: AssessmentStatus;

  @IsOptional()
  @IsString()
  @Field(() => AssessmentType, { nullable: true, defaultValue: AssessmentType.USER_CUSTOM })
  assessmentType?: AssessmentType;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true, defaultValue: 'id' })
  sortColumn?: string;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true, defaultValue: 'DESC' })
  sortOrder?: string;
}