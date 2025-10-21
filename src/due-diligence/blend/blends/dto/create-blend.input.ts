import { InputType, Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { CreateBlendProductInput } from './create-blend-product.input';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


export enum BlendStatus {
  PENDING = 'pending',
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non-compliant',
  UPLOADED_TO_EU_PORTAL = 'uploaded-to-eu-portal',
}

@InputType()
export class CreateBlendInput {
  @Field()
  @IsString()
  name: string;

  @Field()
  @IsString()
  blendCode:string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  netMass?: number;

  @Field(() => Float, { nullable: true })
  @IsNumber()
  @IsOptional()
  volume?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  blendLotId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  finishedProductLotId?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  internalReferenceNumber:string

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  companyId:number

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  countryOfEntry:string[]

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsString({ each: true })
  hideBlendDdsProductIds: string[]

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  activity?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  countryOfActivity:string

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  eudrReferenceNumber?: string;

  @Field(() => [CreateBlendProductInput], { nullable: true })
  blendProducts?: CreateBlendProductInput[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  containerIds?: string[];

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  continueLater?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  blendSettingId?: string;

  @Field(()=>String, { nullable : true})
  @IsOptional()
  @IsEnum(BlendStatus,{
    message: "Blend status must be a valid value."
  })
  blendStatus?: BlendStatus;

  @Field({ nullable: true })
  @IsOptional()
  @IsNumber()
  userId:number
}

@ObjectType()
export class DdrMetricsDto {
  @Field(() => Int, { description: 'Total farm count', defaultValue: 0 })
  totalFarmCount: number;

  @Field(() => Int, { description: 'Total DDs Reports', defaultValue: 0 })
  totalDDSReports: number;

  @Field(() => Float, { description: 'Total Polygon Production Places', defaultValue: 0 })
  totalPolygonProductionPlaces: number;

  @Field(() => Float, { description: 'Total Point Production Places', defaultValue: 0 })
  totalPointProductionPlaces: number;

  @Field(() => Float, { description: 'Total Area High Risk Farms', defaultValue: 0 })
  totalAreaHighRiskFarms:number

  @Field(() => Float, { description: 'Total Area', defaultValue: 0 })
  totalArea: number;

  @Field(() => Int, { description: 'Total Point Production Places', defaultValue: 0 })
  totalDeforestationAssessments: number;

  @Field(() => Int, { description: 'Total Point Production Places', defaultValue: 0 })
  totalHighDeforestationProductionPlaces: number;

  @Field(() => Int, { description: 'Total Point Production Places', defaultValue: 0 })
  totalLowAndZeroRiskFarms: number;

  @Field(() => Float, { description: 'Total Point Production Places', defaultValue: 0 })
  totalAreaLowAndZeroRiskFarms: number;

  @Field(() => Int, { description: 'Total Point Production Places', defaultValue: 0 })
  totalUnknownDeforestationProductionPlaces: number;

  @Field(() => Int, { description: 'Total Point Production Places', defaultValue: 0 })
  totalRiskAssessments: number;

  @Field(() => Float, { description: 'Total Point Production Places', defaultValue: 0 })
  finalAverageGeofenceArea: number;
}

