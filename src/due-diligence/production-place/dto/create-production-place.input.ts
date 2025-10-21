import {
  ArgsType,
  Field,
  Float,
  InputType,
  Int,
  ObjectType,
  PartialType,
  registerEnumType,
} from "@nestjs/graphql";
import {AssessmentQuestions} from "../../../assessment-builder/entities/assessment-questions.entity";
import {DueDiligenceProductionPlace} from "../entities/production-place.entity";
import {IsInt, IsOptional, IsString} from "class-validator";
import { Farm } from "src/farms/entities/farm.entity";
import { UserDDS } from "src/users/entities/dds_user.entity";

export enum FarmType {
  POINT = "POINT",
  POLYGON = "POLYGON",
}

registerEnumType(FarmType, {
  name: "FarmType",
});

@InputType()
export class FarmCoordinatesInput {
  @Field(() => Int, { nullable: true })
  id?: number;
  @Field(() => String, { nullable: true })
  latitude?: string;

  @Field(() => String, { nullable: true })
  longitude?: string;
}

@InputType()
export class FarmPointCoordinatesInput {
  @Field(() => String, { nullable: true })
  centerLatitude?: string;

  @Field(() => String, { nullable: true })
  centerLongitude?: string;

  @Field(() => String, { nullable: true })
  radius?: string;
}

@InputType()
export class CreateProductionPlaceFarmInput {
  @Field(() => Int, { nullable: true })
  geofenceId?: number;
  @Field(() => Int, { nullable: true })
  farmId?: Number;

  @Field(() => String, { nullable: true })
  farmName?: string;

  @Field(() => Float, { nullable: true })
  area?: number;

  @Field(() => FarmType, { nullable: true })
  farmType?: FarmType;

  @Field(() => String, { nullable: true })
  location?: string;

  @Field(() => [FarmCoordinatesInput], { nullable: true })
  coordinates?: FarmCoordinatesInput[];

  @Field(() => FarmPointCoordinatesInput, { nullable: true })
  pointCoordinates?: FarmPointCoordinatesInput;

  @Field(() => String, { nullable: true })
  generateMethod?: string;

  @Field(() => String, {nullable:true })
  registrationNo?:string;

  @Field(() => String, {nullable:true })
  farmerRegId?:string;

  coordinateHash?: string;
}

@InputType()
export class CreateProductionPlaceInput {

  @Field(() => Int, { nullable :true})
  producerId: number;

  @Field(() => String, { nullable: false })
  producerName: string;

  @Field(() => Int, { nullable: true })
  copyOf?: number;

  @Field(() => String, { nullable: false })
  producerCountry: string;

  @Field(() => [CreateProductionPlaceFarmInput], { nullable: true })
  farms?: CreateProductionPlaceFarmInput[];

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isEdit?: boolean;

  @Field(()=>Boolean,{nullable:true, defaultValue: false})
  isVerified?: boolean;
}

@InputType()
export class CreateProductionPlacesInput {
  @Field(() => Int, { nullable :false})
  dueDiligenceReportId: number;

  @Field(() => String, { nullable :true})
  sourceType: string;

  @Field(() => [CreateProductionPlaceInput], { nullable: false })
  productionPlaces: CreateProductionPlaceInput[];
}

@InputType()
export class UpdateProductionPlacesInput{
  @Field(() => Int)
  id: number;

  @Field(() => String, { nullable: false })
  producerName: string;

  @Field(() => String, { nullable: false })
  producerCountry: string;

  @Field(() => Int, { nullable: false })
  dueDiligenceReportId: number;

  @Field(() => CreateProductionPlaceFarmInput, { nullable: true })
  farms?: CreateProductionPlaceFarmInput;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isEdit?: boolean;
  
  @Field(()=>Boolean,{nullable:true, defaultValue: false})
  isVerified?: boolean;
}


@ObjectType()
export class CreateProductionPlaceResponse {
  @Field({ nullable:true })
  success: boolean;

  @Field({ nullable:true })
  message: string;

}
@ArgsType()
export class RemoveFarmArgs {
  @Field(() => Int,{nullable:true})
  production_place_id: number;

  @Field(() => Int,{nullable:true})
  diligence_report_id: number;

  @Field(() => Int,{nullable:true})
  farm_id: number;

  @Field(() => String,{nullable:true})
  eudr_deforestation_status: string;

  @Field(() => String,{nullable:true})
  risk_assessment_status: string;
}

@ArgsType()
export class RemoveUnapprovedFarmArgs {

  @Field(() => Int,{nullable:true})
  diligence_report_id: number;

  @Field(() => Int,{nullable:true})
  assessment_id: number;

}

@ArgsType()
export class RestoreFarmsArgs{
  @Field(() => Int,{nullable:false})
  diligence_report_id: number;

  @Field(() => Int,{nullable:true})
  farm_id: number;
}

@InputType()
export class ProducersFilterInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(()=>String,{nullable:true})
  country?: string

  @Field(() => String, {nullable: true})
  search?: String

  
  @Field(() => Int, {nullable: true})
  supplierId?: number

  
  @Field(() => Int, {nullable: true})
  operatorId?: number
}

@InputType()
export class ProductionPlaceFilterInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(()=>Int,{nullable:true})
  diligenceReportId: number;

  @Field(()=>[Int],{nullable:true})
  diligenceReportIds?: number[];

  @Field(()=>[String],{nullable:true})
  productIds?: string[]

  @Field(()=>Boolean,{nullable:true})
  removed?: boolean;

  @Field(()=>[String],{nullable:true})
  farmCountry?: string[]

  @Field(()=>[String],{nullable:true})
  farmerCountry?: string[]

  @Field(()=>String,{nullable:true})
  farmOwner?: string

  @Field(()=>String,{nullable:true})
  eudrDeforestationStatus?: string

  @Field(()=>String,{nullable:true})
  riskAssessmentStatus?: string

  @Field(()=>String,{nullable:true})
  searchPhrase?: string

  @Field(()=>Int,{nullable:true})
  supplierId?: number

  @Field(()=>String,{nullable:true})
  internalRefNum?: string

  @Field(()=>[String],{nullable:true})
  filterByDateOfRegister?: [string,string]

  @Field(()=>[String],{nullable:true})
  filterByDateOfLastReport?: [string,string]

  @Field(()=>Boolean,{nullable:true})
  isEdit?: boolean;

  @Field(()=>Boolean,{nullable:true})
  isVerified?: boolean;

  @Field(()=>Int,{nullable:true})
  assessmentId?: number

  @Field(() => String, { nullable: true })
  cfRoles?: string;
}

@ObjectType()
export class ProductionPlaceListPaginatedResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [DueDiligenceProductionPlaceExtended], { nullable: false, defaultValue: [] })
  rows: DueDiligenceProductionPlaceExtended[];
}


@ObjectType()
export class ProducersPaginatedResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [UserDDS], { nullable: true })
  rows: UserDDS[];
}

@ObjectType()
export class ProducerEditResponse {

  @Field(()=>String, {nullable:false})
  success?: string


  @Field(()=>String, {nullable:false})
  message?: string
}


@InputType()
export class ProducerAddInput {
  @Field(()=>String,{nullable:true})
  firstName?: string

  @Field(()=>String,{nullable:true})
  lastName?: string

  @Field(()=>String,{nullable:true})
  email?: string

  @Field(()=>String,{nullable:true})
  mobile?: string

  @Field(()=>String,{nullable:true})
  countryId?: string
}

@InputType()
export class ProducerEditInput {
  @Field(() => Int, { nullable: false })
  id:number
  
  @Field(()=>String,{nullable:true})
  firstName?: string

  @Field(()=>String,{nullable:true})
  lastName?: string

  @Field(()=>String,{nullable:true})
  email?: string

  @Field(()=>String,{nullable:true})
  mobile?: string

  @Field(()=>String,{nullable:true})
  countryId?: string
}

@ObjectType()
export class DueDiligenceProductionPlaceExtended extends DueDiligenceProductionPlace {
  @Field(() => String, { nullable: true })
  farmType?: string;
}

@ObjectType()
export class RemoveFarmResponse {
  @Field(() => Boolean)
  success: boolean;

  @Field(() => String)
  message: string;
}

@InputType()
export class RiskAssessmentStatusInput{
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true})
  productionPlaceId: number;

  @IsInt()
  @Field(() => Int, { nullable: false})
  diligenceReportId: number;

  @IsInt()
  @Field(() => Int, { nullable: false})
  assessmentId: number

  @IsString()
  @Field(() => String, { nullable: true, defaultValue: '' })
  riskAssessmentStatus: string;
  
  @IsString()
  @Field(() => String)
  taggableType: string;
}

@ObjectType()
export class GeneralResponseFormat {
  @Field()
  success: boolean;

  @Field()
  message: string;
}

@InputType()
export class UpdateEUDRDeforestationStatusInput{
    @Field(() => [Int], { nullable: false })
    farm_id: number[];

    @Field(() => Int, { nullable: false })
    diligence_report_id: number;

    @Field(() => String, { nullable: true })
    eudr_s3_key: string;

    @Field(() => String, { nullable: true })
    eudr_s3_location: string;

    @Field(() => String, { nullable: true })
    eudr_deforestation_status: string;

    @Field(() => String, { nullable: true })
    eudr_comment: string;
}

@InputType()
export class PolygonOverlapInput {
  @Field(() => [ProductionPlaceInput])
  productionPlaces: ProductionPlaceInput[];
}

@InputType()
class ProductionPlaceInput {
  @Field()
  farmType: string;

  @Field(() => Farm)
  farm: Farm;
}


@InputType()
export class DiligenceReportConcludeStatusInput {
    @IsInt()
    @Field(() => Int, { nullable: false })
    reportId?: number;
}

@ObjectType()
export class ConcludeDigelienceReportWarings {
  @IsInt()
  @Field(() => Int, { nullable: false })
  deforestationStatusOtherThanZeroCount?:number

  @IsInt()
  @Field(() => Int, { nullable: false })
  riskAssessmentStatusOtherThanZeroCount?:number

  @IsInt()
  @Field(() => Int, { nullable: false })
  graterThanFourHectorCount?:number

  @IsInt()
  @Field(() => Int, { nullable: false })
  farmCreatedInOceanCount?:number

  @IsInt()
  @Field(() => Int, { nullable: false })
  farmCreatedInDifferentLocationCount?:number

  @IsInt()
  @Field(() => Int, { nullable: false })
  geofenceNotCheckYetCount?:number
}
