import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { RiskCriteriaLevel } from './risk-assessment-criteria-level.enum';
import { IsString, IsOptional, IsNumber, IsObject, IsInt } from 'class-validator';
import { RegionalRiskAssessment } from '../entities/regional-risk-assessment.entity';

@InputType()
export class CreateRegionalRiskAssessmentInput {
  @Field(() => String)
  @IsString()
  country: string;

  @Field(() => GraphQLJSON)
  @IsObject()
  riskCriteriaIdWithLevels: Record<number, RiskCriteriaLevel>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reportDetails?: string;
}

@InputType()
export class UpdateRegionalRiskAssessmentInput {
  @Field(() => Number)
  @IsNumber()
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  @IsObject()
  riskCriteriaIdWithLevels?: Record<number, RiskCriteriaLevel>;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  reportDetails?: string;
}

@InputType()
export class RegionalRiskAssessmentFilterInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => [String], { nullable: true })
  search?: string[];

  @Field(() => String, {nullable: true})
  sortBy?: string

  @Field(() => String, {nullable: true})
  sortOrder?: string
}

@ObjectType()
export class RegionalRiskAssessmentResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [EnhancedRegionalRiskAssessmentResponse], { nullable: true })
  rows: EnhancedRegionalRiskAssessmentResponse[];
}
@ObjectType()
export class RiskCriteriaLevelWithDescription {
  @Field(() => Int, { description: 'Risk criteria ID' })
  id: number;

  @Field(() => String, { description: 'Risk level' })
  level: string;

  @Field(() => String, { description: 'Risk criteria description' })
  description: string;
}
@ObjectType()
export class EnhancedRegionalRiskAssessmentResponse {
  @Field(() => Int, { description: 'ID of the regional risk assessment' })
  id: number;

  @Field(() => String, { description: 'Country of the regional risk assessment' })
  country: string;

  @Field(() => [RiskCriteriaLevelWithDescription], { description: 'Enriched risk criteria levels' })
  riskCriteriaIdWithLevels: RiskCriteriaLevelWithDescription[];

  @Field(() => String, { nullable: true, description: 'Report details' })
  reportDetails?: string;

  @Field(() => Date, { description: 'Creation date' })
  createdAt: Date;
}