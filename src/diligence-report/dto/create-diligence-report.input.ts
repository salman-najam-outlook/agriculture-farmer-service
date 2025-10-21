import {
    InputType,
    Int,
    Field,
    Float,
    ObjectType
} from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsInt, IsOptional } from 'class-validator';
import { DiligenceReport } from '../entities/diligence-report.entity';
import { Job } from 'src/job/entities/job.entity';
import { DiligenceActivityLog } from '../entities/diligence-activity-log.entity';

@InputType()
export class DiligenceCurrentStageInput {
    @Field(() => Int, { nullable: false })
    reportId: number;

    @Field(() => Int, { nullable: true })
    current_stage: number;
}

@InputType()
export class DiligenceReportIdInput {
    @Field(() => Int, { nullable: false })
    reportId: number;
}

@InputType()
class SupplierInfo {
    @Field(() => Int, { nullable: true })
    id: number;

    @Field(() => String, { nullable: true })
    fullName: string;

    @Field(() => String, { nullable: true })
    email: string;

    @Field(() => String, { nullable: true })
    mobile: string;

    @Field(() => String, { nullable: true })
    country: string;
}

@InputType()
class OperatorInfo {
    @Field(() => Int, { nullable: true })
    id: number;

    @Field(() => String, { nullable: true })
    fullName: string;

    @Field(() => String, { nullable: true })
    email: string;

    @Field(() => String, { nullable: true })
    mobile: string;

    @Field(() => String, { nullable: true })
    country: string;

    @Field(() => String, { nullable: true })
    eori_number: string;
}


@InputType()
class RequiredAssessment {
    @Field(() => Int, { nullable: true })
    id: number;

    @Field(() => String, { nullable: true })
    assessment: string;

    @Field(() => String, { nullable: true })
    farm: string;

    @Field(() => String, { nullable: true })
    type: string;
}


@InputType()
export class DiligenceReportInput {

    @Field(() => Int, { nullable: true })
    id?: number;

    @Field(() => SupplierInfo, { nullable: true })
    supplier: SupplierInfo;

    @Field(() => String, { nullable: true })
    whoAddPlaceData: string;

    @Field(() => [String], { nullable: true })
    countryOfProduction: string[];

    @Field(() => [String], { nullable: true })
    assessmentCountries: string[];

    @Field(() => Int, { nullable: true })
    exporter_id?: number;

    @Field(() => [RequiredAssessment], { nullable: true })
    requiredAssessment: RequiredAssessment[];

    @Field(() => String, { nullable: true })
    internalReferenceNumber: string;

    @Field(() => String, { nullable: true })
    EUDRReferenceNumber: string;

    @Field(() => String, { nullable: true })
    companyID: string;

    @Field(() => [String], { nullable: true })
    containerIds: string[];

    @Field(() => String, { nullable: true })
    activity: string;

    @Field(() => [String], { nullable: true })
    countryOfActivity: string[];

    @Field(() => String, { nullable: true })
    countryOfEntry: string;

    @Field(() => Int, { nullable: true })
    product: number;

    // @Field(() => String, { nullable: true })
    // country: string;

    @Field(() => Int, { nullable: true })
    subProduct: number;

    @Field(() => String, { nullable: true })
    productDescription?: string;

    @Field(() => String, { nullable: true })
    productNetMass?: string;

    @Field(() => String, { nullable: true })
    productVolume?: string;

    @Field(() => String, { nullable: true })
    productScientificName?: string;

    @Field(() => String, { nullable: true })
    productCommonName?: string;
    
    @Field(() => Int, {nullable: true })
    current_step: number

    @Field(() => String, {nullable: true })
    eudrAssessmentType: string

    // @Field(() => [farmGeofence], { nullable: true })
    // farmGeofence?: [farmGeofence];

    @Field(() => Float, {nullable: true })
    pointFarmDefaultArea: number

    @Field(() => String, { nullable: true })
    createdAt?: string;

    @Field(() => String, { nullable: true })
    updatedAt?: string;

    @Field(() => Boolean, { nullable: true })
    enableRegionalRiskAssessment: boolean;

    @Field(() => Boolean, { nullable: true })
    enableRiskAssessmentCriteria?: boolean;
    
    @Field(() => Boolean, { nullable: true })
    enableProtectedAndIndigenousAreas?: boolean;
    
    @Field(() => Boolean, { nullable: true })
    enableRiskWarningPopupNotifications?: boolean;

    @Field(() => Boolean, { nullable: true })
    enableOnScreenRiskWarnings?: boolean;

    @Field(() => String, { nullable: true })
    comments: string;

    @Field(() => String, { nullable: true })
    eudrVerificationNo: string;

    @Field(() => Boolean, { nullable: true })
    isGeolocationPrivate: boolean;
    
}


@InputType()
export class DiligenceReportInputBySupplier {

    @Field(() => Int, { nullable: true })
    id?: number;

    @Field(() => OperatorInfo, { nullable: true })
    operator: OperatorInfo;

    @Field(() => [String], { nullable: true })
    assessmentCountries: string[];

    @Field(() => [String], { nullable: true })
    countryOfProduction: string[];

    @Field(() => [RequiredAssessment], { nullable: true })
    requiredAssessment: RequiredAssessment[];

    @Field(() => String, { nullable: true })
    internalReferenceNumber: string;

    @Field(() => String, { nullable: true })
    EUDRReferenceNumber: string;

    @Field(() => String, { nullable: true })
    companyID: string;

    @Field(() => Int, { nullable: true })
    exporter_id?: number;

    @Field(() => [String], { nullable: true })
    containerIds: string[];

    @Field(() => String, { nullable: true })
    activity: string;

    @Field(() => [String], { nullable: true })
    countryOfActivity: string[];

    @Field(() => String, { nullable: true })
    countryOfEntry: string;

    @Field(() => Int, { nullable: true })
    product: number;

    // @Field(() => String, { nullable: true })
    // country: string;

    @Field(() => Int, { nullable: true })
    subProduct: number;

    @Field(() => String, { nullable: true })
    productDescription?: string;

    @Field(() => String, { nullable: true })
    productNetMass?: string;

    @Field(() => String, { nullable: true })
    productVolume?: string;

    @Field(() => String, { nullable: true })
    productScientificName?: string;

    @Field(() => String, { nullable: true })
    productCommonName?: string;

    @Field(() => Int, {nullable: true })
    current_step: number
    
    @Field(() => String, {nullable: true })
    eudrAssessmentType: string
    // @Field(() => [farmGeofence], { nullable: true })
    // farmGeofence?: [farmGeofence];


    @Field(() => String, { nullable: true })
    createdAt?: string;

    @Field(() => String, { nullable: true })
    updatedAt?: string;

    @Field(() => Boolean, { nullable: true })
    enableRiskWarningPopupNotifications?: boolean;

    @Field(() => Boolean, { nullable: true })
    enableOnScreenRiskWarnings?: boolean;

    @Field(() => Boolean, { nullable: true })
    enableRegionalRiskAssessment: boolean;

    @Field(() => String, { nullable: true })
    comments: string;
}

@ObjectType()
export class DigiligenceReportStatusUpdate {

  @Field(()=>String, {nullable:false})
  success?: string


  @Field(()=>String, {nullable:false})
  message?: string
}


@InputType()
export class ChangeStatusOfDiligenceReportInput {

    @Field(() => Int, { nullable: false })
    id: number;

    @Field(() => String, { nullable: false })
    status: string;
}

@InputType()
export class UpdateWhoAddPlaceDataInput {

    @Field(() => Int, { nullable: false })
    id: number;

    @Field(() => String, { nullable: false })
    whoAddPlaceData: string;

    @Field(() => String, { nullable: true })
    status: string;
}

@InputType()
export class CreateDiligenceActivityLogInput {
    @Field(() => Int, { nullable: false })
    diligence_id: number;

    @Field(() => Int, { nullable: false })
    user_id: number;

    @Field(() => String, { nullable: false })
    activity: string;

    @Field(() => String, { nullable: false })
    description: string;

    @Field(() => String, { nullable: true })
    ip_address?: string;
}

@ObjectType()
export class DiligenceReportsPaginatedResponse {
    @Field(() => Int, { nullable: true })
    count: number;

    @Field(() => Int, { nullable: true })
    totalCount: number;

    @Field(() => [DiligenceReport], { nullable: true })
    rows: DiligenceReport[];
}

@ObjectType()
export class BulkOperationResponse {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String)
    message: string;

    @Field(() => Int)
    processedCount: number;

    @Field(() => [Int], { nullable: true })
    failedReportIds?: number[];
}



@InputType()
export class DiligenceReportsFilterInput {
    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    page?: number;

    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    limit?: number;

    // Search functionality
    @Field(() => String, { nullable: true })
    searchPhrase?: string

    // Search by specific IDs
    @IsOptional()
    @Field(() => Int, { nullable: true })
    searchByReportId?: number

    // Filter dropdowns from UI
    @Field(() => [Int], { nullable: true })
    exporterIds?: number[]

    @Field(() => Int, { nullable: true })
    exporterId?: number

    @Field(() => [Int], { nullable: true })
    supplierIds?: number[]

    @Field(() => Int, { nullable: true })
    supplierId?: number

    @Field(() => [Int], { nullable: true })
    assignedToIds?: number[]

    @Field(() => Int, { nullable: true })
    assignedTo?: number

    @Field(() => Boolean, { nullable: true })
    assignedToMe?: boolean

    @Field(() => String, { nullable: true })
    status?: string

    @Field(() => String, { nullable: true })
    statusLegends?: string

    @Field(() => [String], { nullable: true })
    statuses?: string[]

    @Field(() => [String], { nullable: true })
    statusLegendsArray?: string[]

    // Additional filters
    @Field(() => String, { nullable: true })
    country?: string

    @Field(() => Int, { nullable: true })
    operatorId?: number
    
    @Field(() => String, { nullable: true })
    whoWillAddData?: string

    @IsOptional()
    @Field(() => [String], { nullable: true })
    cfroles?: string[];

    @Field(() => Boolean, { nullable: true, defaultValue: false })
    isPtsiApproval?: boolean;

    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    cooperativeId?: number;

    // Date and product filters similar to dashboard statistics
    @Field(() => String, { nullable: true, description: 'Filter type: today, week, month, year, all, or custom' })
    filterType?: string;

    @Field(() => String, { nullable: true, description: 'Start date for filtering (YYYY-MM-DD)' })
    startDate?: string;

    @Field(() => String, { nullable: true, description: 'End date for filtering (YYYY-MM-DD)' })
    endDate?: string;

    @Field(() => [Int], { nullable: true, description: 'Filter by product IDs' })
    products?: number[];
}


@InputType()
export class RequestAdditionalInformationInput {

  @Field(() => Int, { nullable: false })
    supplierId: number

  @Field(() => Int, { nullable: false })
  dueDiligenceReportId: number;

  @Field(() => String, { nullable: false })
  description: string;

  @Field(() => String, { nullable: true })
  shareAccess?: string;

  @Field(() => [String], { nullable: true })
  selectedStep?: string[];

  @Field(() => Boolean, { nullable: true })
  attachAllHighRiskFarms?: boolean;

  @Field(() => Int, { nullable: true })
  cfUserId?: number;


  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isPtsiApproval?: boolean;
}

@InputType()
export class SupplierDataInput {
    @Field(() => String, { nullable: false })
    fullName: string;

    @Field(() => String, { nullable: false })
    email: string;

    @Field(() => String, { nullable: false })
    mobile: string;

    @Field(() => String, { nullable: false })
    countryId: string;

    @Field(() => String, { nullable: false })
    status: string;
    
    @Field(() => Int, { nullable: false })
    verified: number
}

@InputType()
export class ShareReportOperatorInput {
    @Field(() => Int, { nullable: false })
    diligenceReportId: number;

    @Field(() => Int, { nullable: false })
    operatorId: number;
}

@InputType()
export class BulkAssignReportsInput {
    @Field(() => [Int], { nullable: false })
    reportIds: number[];

    @Field(() => Int, { nullable: false })
    assignedTo: number;
}

@InputType()
export class ApproveReportAndBlockChainInput {
    @Field(() => [Int], { nullable: false })
    reportIds: number[];

    @Field(() => Int, { nullable: false })
    assignedTo: number;
}

@InputType()
export class BulkApproveReportsInput {
    @Field(() => [Int], { nullable: false })
    reportIds: number[];

    @Field(() => Boolean, { nullable: true, defaultValue: false })
    isTemporaryApproval?: boolean;

    @Field(() => Int, { nullable: true })
    approvalExpirationValue?: number;

    @Field(() => String, { nullable: true })
    approvalExpirationUnit?: string;
}

@ObjectType()
export class BulkApproveBlockchainReportsInput {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => [Job], { nullable: true })
    jobs?: Job[];
}

@InputType()
export class BulkRejectReportsInput {
    @Field(() => [Int], { nullable: false })
    reportIds: number[];

    @Field(() => String, { nullable: false })
    reason: string;
}

@InputType()
export class UpdatePointFarmDefaultAreaInput {
    @Field(() => Int)
    id: number;

    @Field(() => Float)
    pointFarmDefaultArea: number;
}




@ObjectType()
export class RequestAdditionalInformationInputResponse {
    @Field({ nullable: true })
    success: boolean;

    @Field({ nullable: true })
    message: string;

}

@ObjectType()
export class RemoveRequestAdditionalInformationResponse {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => String)
    message: string;

    @Field(() => Int)
    deletedCount: number;
}

@ObjectType()
export class GenerateComplianceByDiligenceResponse {
    @Field(() => Boolean)
    success: boolean;

    @Field(() => Job, { nullable: true })
    job: Job;
}


@ObjectType()
export class StatusOption {
    @Field(() => String)
    key: string;

    @Field(() => String)
    label: string;
}

@ObjectType()
export class StatusCategories {
    @Field(() => [StatusOption])
    dueDiligenceStatus: StatusOption[];

    @Field(() => [StatusOption])
    reportStatus: StatusOption[];
}

@InputType()
export class DiligenceActivityLogFilterInput {
    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    page?: number;

    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    limit?: number;

    @Field(() => String, { nullable: true })
    searchPhrase?: string;

    @Field(() => String, { nullable: true })
    userRole?: string;

    @Field(() => String, { nullable: true })
    activity?: string;

    @Field(() => String, { nullable: true })
    orderField?: string;

    @Field(() => String, { nullable: true })
    order?: string;

    // Cooperative ID from frontend (corresponds to cf_id in organization table)
    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    cooperativeId?: number;
}

@ObjectType()
export class DiligenceActivityLogPaginatedResponse {
    @Field(() => Int, { nullable: true })
    count: number;

    @Field(() => Int, { nullable: true })
    totalCount: number;

    @Field(() => [DiligenceActivityLog], { nullable: true })
    rows: DiligenceActivityLog[];
}

@InputType()
export class DateFilterInput {
    @Field(() => String, { nullable: true })
    dateFilter?: string; // 'today', 'week', 'month', 'year', 'all'

    @Field(() => String, { nullable: true })
    startDate?: string; // Custom start date (YYYY-MM-DD format)

    @Field(() => String, { nullable: true })
    endDate?: string; // Custom end date (YYYY-MM-DD format)

    @Field(() => Int, { nullable: true })
    productId?: number; // Product ID filter (2, 3, 5)
}
