import { InputType, Int, Field, Float, ObjectType } from "@nestjs/graphql";
import { Transform, Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { DeforestationReportRequest } from "../entities/deforestation_report_request.entity";
// import { ApiPropertyOptional } from "@nestjs/swagger";
 
@InputType()
export class DeforestCreateFarmInput {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => String, { nullable: true })
  farmName?: string;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => String, { nullable: true })
  registrationNo?: string;

  @Field(() => Float, { nullable: true })
  lat?: number;

  @Field(() => Float, { nullable: true })
  log?: number;

  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  area?: string;

  @Field(() => Int, { nullable: true })
  areaUomId?: number;

  @Field(() => Int, { nullable: true })
  parameter?: number;

  @Field(() => Int, { nullable: true })
  parameterUomId?: number;

  @Field(() => String, { nullable: true })
  farmOwnershipType?: string;

  @Field(() => Int, { nullable: true })
  farmType?: number;

  @Field(() => String, { nullable: true })
  productionSystem?: string;

  @Field(() => String, { nullable: true })
  farmOwner?: string;

  @Field(() => Int, { nullable: true })
  userId?: number;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  govRegistrationNum?: string;

  @Field(() => String, { nullable: true })
  contractMating?: string;

  @Field(() => String, { nullable: true })
  cooperativeId?: string;

  @Field(() => String, { nullable: true })
  cooperativeName?: string;

  @Field(() => String, { nullable: true })
  licenceNum?: string;

  @Field(() => String, { nullable: true })
  licenceExpiryDate?: string;

  @Field(() => String, { nullable: true })
  regulatorName?: string;

  @Field(() => String, { nullable: true })
  houseNum?: string;

  @Field(() => String, { nullable: true })
  street?: string;

  @Field(() => String, { nullable: true })
  farmNumber?: string;

  @Field(() => String, { nullable: true })
  communityName?: string;

  @Field(() => String, { nullable: true })
  regulatorRepresentiveName?: string;

  @Field(() => String, { nullable: true })
  isDeleted?: string;

  @Field(() => String, { nullable: true })
  farmingActivity?: string;

  @Field(() => [DeforestFarmCoordinatesInput], { nullable: true })
  FarmCoordinates?: DeforestFarmCoordinatesInput[];

  @Field(() => [DeforestGeofenceInput], { nullable: true })
  GeoFences?: DeforestGeofenceInput[];

  @Field(() => Int, { nullable: true })
  clientId?: number;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;
}

@InputType()
class OrgInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => String, { nullable: true })
  name: string;

  @Field(() => String, { nullable: true })
  code: string;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
@InputType()
class DeforestFarmCoordinatesInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => String, { nullable: true })
  lat: string;

  @Field(() => String, { nullable: true })
  log: string;

  @Field(() => Int, { nullable: true })
  farmId: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}

@InputType()
class DeforestGeofenceInput {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => Int, { nullable: true })
  farmId: number;

  @Field(() => String, { nullable: true })
  geofenceName: string;

  @Field(() => Float, { nullable: true })
  geofenceArea: number;

  @Field(() => Int, { nullable: true })
  geofenceAreaUOMId: number;

  @Field(() => Float, { nullable: true })
  geofenceParameter: number;

  @Field(() => Int, { nullable: true })
  geofenceParameterUOMId: number;

  @Field(() => Int, { nullable: true })
  walkAndMeasure: number;

  @Field(() => Boolean)
  is_deleted: boolean;

  @Field(() => [DeforestGeofenceCoordinatesDto], { nullable: true })
  geofenceCoordinates: DeforestGeofenceCoordinatesDto[];
}

@InputType()
export class DeforestGeofenceCoordinatesDto {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => String, { nullable: true })
  lat: string;

  @Field(() => String, { nullable: true })
  log: string;

  @Field(() => Int, { nullable: true })
  geofenceId: number;
}

@InputType()
export class DeforestCreateUserInput {
  @Field(() => Int, { nullable: true, description: "user id" })
  id?: number;

  @Field({ description: "first name", nullable: true })
  firstName?: string;

  @Field({ description: "last name", nullable: true })
  lastName?: string;

  @Field(() => Int, { description: "country code", nullable: true })
  countryCode?: number;

  @Field({ description: "mobile", nullable: true })
  mobile?: string;

  @Field({ description: "email", nullable: true })
  email?: string;

  @Field({ description: "unverifiedMobile", nullable: true })
  unverifiedMobile?: string;

  @Field({ description: "unverifiedEmail", nullable: true })
  unverifiedEmail?: string;

  @Field({ description: "password", nullable: true })
  password?: string;

  @Field({ description: "language", nullable: true })
  language?: string;

  @Field(() => String, { description: "country id", nullable: true })
  countryId?: string;

  @Field(() => String, { description: "state id", nullable: true })
  stateId?: string;

  @Field({ description: "district", nullable: true })
  district?: string;

  @Field({ description: "village", nullable: true })
  village?: string;

  @Field({ description: "otp", nullable: true })
  otp?: string;

  @Field({ description: "businessName", nullable: true })
  businessName?: string;

  @Field({ description: "address", nullable: true })
  address?: string;

  @Field({ description: "fax", nullable: true })
  fax?: string;

  @Field({ description: "website", nullable: true })
  website?: string;

  @Field({ description: "localPremiseId", nullable: true })
  localPremiseId?: string;

  @Field({ description: "federalPremiseId", nullable: true })
  federalPremiseId?: string;

  @Field({ description: "userType", nullable: true })
  userType: string;

  @Field({ description: "registration_type", nullable: true })
  registration_type: string;

  @Field(() => Int, { description: "pushNotification", nullable: true })
  pushNotification?: number;

  @Field(() => Int, { description: "notificationSound", nullable: true })
  notificationSound?: number;

  @Field(() => Int, { description: "isLogin", nullable: true })
  isLogin: number;

  @Field(() => Int, { description: "verified", nullable: true })
  verified: number;

  @Field(() => Int, { description: "active", nullable: true })
  active: number;

  @Field({ description: "profilePicUrl", nullable: true })
  profilePicUrl?: string;

  @Field({ description: "profilePicS3Key", nullable: true })
  profilePicS3Key?: string;

  @Field({ description: "profilePicName", nullable: true })
  profilePicName?: string;

  @Field(() => Int, { description: "organization", nullable: true })
  organization: number;

  @Field({ description: "loginAttempts", nullable: true })
  loginAttempts: string;

  @Field({ description: "lockedToken", nullable: true })
  lockedToken: string;
}
export enum ReportStatus {
  REQUESTED = "REQUESTED",
  PROCESSING = "PROCESSING",
  CERTIFIED = "CERTIFIED",
  CERTIFICATE_READY = "CERTIFICATE_READY",
  FAILED = "FAILED",
}

export enum AdminDisplayType {
  CERTIFICATION = 'certification',
  EUDR_ASSESSMENT = 'eudr-assessment'
}

export enum ReportType {
  REGISTEREDFARM = "REGISTERED_FARM",
  NONREGISTEREDFARM = "NON_REGISTERED_FARM",
}

@InputType()
export class CoordinatesObj {
  @Field(() => String, { nullable: false })
  @Type(() => Number)
  latitude: number;

  @Field(() => String, { nullable: false })
  @Type(() => Number)
  longitude: number;
}

@InputType()
class LocationInfo {
  @IsString()
  @Field(() => String, { nullable: false })
  type: string;
  @ValidateNested()
  @Type(() => CoordinatesObj)
  @Field(() => [CoordinatesObj], { nullable: false })
  coordinates: CoordinatesObj[];
}

@InputType()
export class CreateDeforestationInput {
  @Type(() => OrgInput)
  @Field(() => OrgInput, { nullable: true })
  OrgObj: OrgInput;

  @Type(() => DeforestCreateFarmInput)
  @Field(() => DeforestCreateFarmInput, { nullable: true })
  FarmObj: DeforestCreateFarmInput;

  @Type(() => DeforestCreateUserInput)
  @Field(() => DeforestCreateUserInput, { nullable: false })
  UserObj: DeforestCreateUserInput;

  @IsString()
  @Field(() => String, { nullable: false })
  locationName: string;

  @Field(() => String, { nullable: true })
  zoneName: string;

  @Field(() => String, { nullable: true })
  dimitraUserId: string;

  @Field(() => String, { nullable: true })
  dimitraFarmId: string;

  @Field(() => String, { nullable: true })
  farmRegistrationId: string;

  @Field(() => String, { nullable: true })
  farmerRegistrationId: string;

  @Field(() => Int, { nullable: true })
  farmId: number;

  @Field(() => Int, { nullable: true })
  zoneId: number;

  @IsString()
  @Field(() => String, { nullable: false })
  country: string;

  @IsString()
  @Field(() => String, { nullable: false })
  state: string;

  @Field(() => Float, { nullable: true })
  geofenceArea: number;

  // @IsOptional()
  // @ValidateIf((object, value) => value !== null)
  // @IsString()
  // dateOfInterest: string;

  @ValidateNested()
  @Type(() => LocationInfo)
  @Field(() => LocationInfo, { nullable: false })
  locationInfo: LocationInfo;

  @Field(() => String, { nullable: true })
  reportType: string;

  @Field(() => Float, { nullable: true })
  radius: number;

  @Field(() => Int, { nullable: true })
  reportLimit: number;

  @Field(() => String, { nullable: true })
  reportDuration: string;

  @Field(() => String, { nullable: true })
  reportTypeUnit: string;
}

@ObjectType()
export class DeforestationPagination {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [DeforestationReportRequest], { nullable: true })
  rows: [DeforestationReportRequest];
}

@ObjectType()
export class AverageProb {
  @Field(() => Float)
  percent: number;

  @Field(() => String)
  label: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  colorCode: string;
}

@InputType()
export class GetDeforestationInput {
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  search: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  country: string;

  //region
  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  state: string;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  farmId: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  status: string;

  @IsOptional()
  @IsBoolean()
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isCertified: boolean;
}


@InputType()
export class GetCertificateInputAdmin extends GetDeforestationInput{
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true, defaultValue: false })
  organization: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true, defaultValue: '' })
  adminReportType: string;
}

@InputType()
export class GetCertificateInput extends GetDeforestationInput {}

export class UserUnitInput {
  @IsOptional()
  // @IsString()
  abbvr: string;

  @IsOptional()
  // @IsNumber()
  factor: number;

  @IsOptional()
  // @IsString()
  name: string;
}
export class DownloadPdfInput {
  // @ApiPropertyOptional()
  @IsNotEmpty()
  id: number;

  // @ApiPropertyOptional()
  // @IsNotEmpty()
  // @IsString()
  // lang: string;

  // @ApiPropertyOptional({ type: String, format: "binary" })
  // @IsOptional()
  // file: string;
  @IsOptional()
  roles: string;

  @IsOptional()
  platform:string

  @IsOptional()
  veryHighProb:string

  @IsOptional()
  highProb:string

  @IsOptional()
  mediumProb:string

  @IsOptional()
  lowProb:string

  @IsOptional()
  veryLowProb:string

  @IsOptional()
  zeroProb:string

  @IsOptional()
  totalGeofence:string

  @IsOptional()
  // @ValidateNested()
  @Type(() => UserUnitInput)
  userUnit: UserUnitInput;
}


export interface IPythonResponse {
  aoiId?: number;
  geometryType: string;
  issueDate: string;
  message: string;
  modelVersion: number;
  circularDataSHA256: string;
  polygonalDataSHA256: string;
  reportVersion: number;
  result: Result;
  success: boolean;
  title: string;
  error: Object
}

export interface Result {
  allProbImageS3Key: string;
  finalDetectionS3Key: string;
  highProb: number;
  highProbPercent: number;
  highProbColor: string;
  highProbColorName: string;
  lowProb: number;
  lowProbPercent: number;
  lowProbColor: string;
  lowProbColorName: string;
  overallProb: string;
  totalArea: number;
  zeroProb: number;
  zeroProbPercent: number;
  zeroProbColor: string;
  zeroProbColorName: string;
  mediumProb: number;
  mediumProbPercent: number;
  mediumProbColor: string;
  mediumProbColorName: string;
  veryHighProb: number;
  veryHighProbPercent: number;
  veryHighProbColor: string;
  veryHighProbColorName: string;
  veryLowProb: number;
  veryLowProbPercent: number;
  veryLowProbColor: string;
  veryLowProbColorName: string;
  protectedAreasAlerts?: string[];
  indigenousLand?: string[];
  country?: {
    code: string;
    name: string;
  };
}

export interface IBlockChainData {
  AssessmentNumber: string;
  ModelVersion: string;
  ReportVersion: string;
  GeometryType: string;
  IssueDate: string;
  FarmerUUID: string;
  FarmUUID: string;
  HashAlgorithm: "SHA-256";
  GeometryHash?: string;
  OverallDeforestationProbability: string;
  SubReports?: Omit<IBlockChainData, 'SubReports'>[];
}

@InputType()
export class EUDRDeforestationStatusInput{
  @IsInt()
  @Field(() => Int, { nullable: false})
  farmId: number;

  @IsString()
  @Field(() => String, { nullable: true, defaultValue: '' })
  eudr_deforestation_status: string;
}

@ObjectType()
export class UpdateEUDRDeforestationStatusResponse {
  @Field()
  success: boolean;

  @Field()
  message: string;
}
@InputType()
export class RequestCertificateForUserInput {
  @IsInt()
  @Field(() => Int, { nullable: false })
  reportId: number;

  @IsInt()
  @Field(() => Int, { nullable: false })
  userId: number;
}

@InputType()
export class DetectDeforestationBulkInput {
  @IsInt()
  @Field(() => Int, { nullable: false })
  productionPlaceId: number;

  @IsInt()
  @Field(() => Int, { nullable: false })
  aoiId: number;

  @IsString()
  @Field(() => String, { nullable: true, defaultValue: ''  })
  type: string;

  @IsString()
  @Field(() => String, { nullable: true, defaultValue: '' })
  name: string;
  
  @ValidateNested()
  @Type(() => CoordinatesObj)
  @Field(() => [CoordinatesObj], { nullable: false })
  coordinates: CoordinatesObj[];
}
