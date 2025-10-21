import {ObjectType, Field, Int, ID, Float} from '@nestjs/graphql';
import {Column, Table, Model, HasMany, DataType, BelongsTo, ForeignKey, BelongsToMany, HasOne } from 'sequelize-typescript';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { ShipmentDueDeligenceReport } from 'src/shipment/entities/shipment-duedeligence-report.entity';
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import { DiligenceReportAssessment } from './diligence-report-assessment.entity';
import {Shipment} from "../../shipment/entities/shipment.entity";
import {DATE} from "sequelize";
import { DiligenceReportTransaction } from './diligence-report-transaction.entity';
import { ManageProduct } from 'src/due-diligence/blend/manage-products/entities/manage-products.entity';
import { ManageSubproduct } from 'src/due-diligence/blend/manage-products/entities/manage-subproduct.entity';
import { DiligenceReportProductionPlace } from './diligence-report-production-place.entity';
import { RequestAdditionalInformation } from './diligence-report-request-additional-request.entity';
import { DdsReportExporter } from './dds-report-exporter.entity';

// pasture mgmt model is satellite report table

@ObjectType()
export class DeligenceReportCurrentStageResponse {
  @Field(() => Int, { nullable: true})
  current_step:number
}

@ObjectType()
export class DeligenceReportCurrentStageUpdateResponse {
  @Field(() => String, { nullable: true})
  message:string
}

@ObjectType()
export class DeligenceReporBlockchainPublishUpdateResponse {
  @Field(() => String, { nullable: true})
  message:string

  @Field(() => Date, {nullable:true})
  blockchainPublishDate:Date
}
@ObjectType()
export class CheckProductionPlaceResult {
    @Field(() => Int, {nullable: true})
    count : number;
}
@ObjectType()
class RequiredAssessment1 {
    @Field(() => Int, {nullable: true})
    id : number;

    @Field(() => String, {nullable: true})
    assessment : string;

    @Field(() => String, {nullable: true})
    farm : string;

    @Field(() => String, {nullable: true})
    type : string;
}


@ObjectType()
class UploadedGeoJSONFile {
  @Field(() => String, { nullable: true })
  uploadedS3FileKey: string;

  @Field(() => String, { nullable: true })
  location: string;
}

@Table({tableName: 'diligence_reports', timestamps:true})
@ObjectType()
export class DiligenceReport extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'deligence id' })
  id: number;

  @ForeignKey(()=>User)
  @Column
  @Field(() => String, {nullable: true })
  supplierId: string

  @BelongsTo(() => User, {foreignKey:'supplierId', as:"supplier",})
  @Field(() => User, { nullable:true })
  supplier: User;

  @ForeignKey(()=>User)
  @Column
  @Field(() => String, {nullable: true })
  operatorId: string

  @BelongsTo(() => User, {foreignKey:'operatorId', as:"operator",})
  @Field(() => User, { nullable:true })
  operator: User;

  @ForeignKey(()=>User)
  @Column
  @Field(() => String, {nullable: true })
  userId: string

  @BelongsTo(() => User, {foreignKey:'userId', as :'user'})
  @Field(() => User, { nullable:true })
  user: User;

  @HasOne(() => DdsReportExporter, { foreignKey: 'diligence_report_id', as: 'ddsReportExporter' })
  @Field(() => DdsReportExporter, { nullable: true })
  ddsReportExporter: DdsReportExporter;


  @ForeignKey(() => ManageProduct)
  @Column
  @Field(() => String, { nullable: true })
  product: string;


  @BelongsTo(() => ManageProduct, { foreignKey: 'product',targetKey:'id'})
  @Field(() => ManageProduct, { nullable: true })
  product_detail: ManageProduct

  @Field(() => Int, {nullable:true})
  productionPlaceCount: number

  @Column
  @Field(() => String, {nullable: true })
  whoAddPlaceData: string

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
    
  @Field(() => [String], { nullable: true })
  countryOfProduction: string[];
    
  @Field(() => [String], { nullable: true })
  assessmentCountries: string[];

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
  @Field(() => [RequiredAssessment1], {nullable: true })
  requiredAssessment: RequiredAssessment1[];

  @Column
  @Field(() => String, {nullable: true })
  internalReferenceNumber: string

  @Column
  @Field(() => String, {nullable: true })
  EUDRReferenceNumber: string

  @Column
  @Field(() => String, {nullable: true })
  companyID: string

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
  @Field(() => [String], { nullable: true })
  containerIds: string[];

  @Column
  @Field(() => String, {nullable: true })
  activity: string

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
  @Field(() => [String], {nullable: true })
  countryOfActivity: string[]

  @Column
  @Field(() => String, {nullable: true })
  countryOfEntry: string

  @Column
  @Field(() => String, {nullable: true })
  subProduct: string

  @BelongsTo(() => ManageSubproduct, { foreignKey: 'subProduct',targetKey:'id'})
  @Field(() => ManageSubproduct, { nullable: true })
  sub_product_detail: ManageSubproduct

  @Column
  @Field(() => String, {nullable: true })
  productDescription: string

  @Column
  @Field(() => String, {nullable: true })
  productNetMass: string

  @Column
  @Field(() => String, {nullable: true })
  productVolume: string

  @Column
  @Field(() => String, {nullable: true })
  productScientificName: string

  @Column
  @Field(() => String, {nullable: true })
  productCommonName: string

  @Column
  @Field(() => String, {nullable: true, defaultValue: "Pending" })
  status: string
  
  @Column
  @Field(() => String, {nullable: true })
  productionPlaceSource: string
 
  @HasMany(() => DiligenceReportProductionPlace, { foreignKey:'diligenceReportId' })
  @Field(() => [DiligenceReportProductionPlace], { defaultValue: [] })
  dueDiligenceProductionPlaces: DiligenceReportProductionPlace[];

  @HasMany(() => DiligenceReportAssessment)
  @Field(() => [DiligenceReportAssessment], { nullable:true, defaultValue:[] })
  diligenceReportAssessment: DiligenceReportAssessment[];

  @BelongsToMany(() => Shipment, () => ShipmentDueDeligenceReport)
  @Field(() => [Shipment], { nullable: true })
  shipment: Shipment[];

  @Column
  @Field(() => String, {nullable: true })
  current_step: string

  @Column
  @Field(() => String, {nullable: true })
  eudrAssessmentType: string

  @Column
  @Field(() => Float, {nullable: true })
  pointFarmDefaultArea: number

  @Column
  @Field(() => Int, {nullable: true })
  organizationId: number

  @Column
  @Field(() => Int, {nullable: true })
  subOrganizationId: number

  @Column({ type: DATE})
  @Field(() => Date, {nullable: true })
  createdAt: Date;

  @Column({ type: DATE})
  @Field(() => Date, {nullable: true })
  updatedAt: Date;
  
  @Column
  @Field(() => Boolean, {nullable: true })
  isDeleted: boolean

  @Column
  @Field(() => Boolean, {nullable: true, defaultValue: false })
  sendToOperator: boolean
  
  @HasMany(() => DiligenceReportTransaction)
  transactions: DiligenceReportTransaction[];

  @Field(() => DiligenceReportTransaction, { nullable: true })
  transaction: DiligenceReportTransaction;

  @Field(() => String, { nullable: true })
  blockchainLink: String;

  @Field(() => String, { nullable: true })
  encId: String;

  @Column
  @Field(() => Boolean, {nullable: true })
  enableRegionalRiskAssessment: Boolean;

  @Column
  @Field(() => Boolean, {nullable: true })
  enableRiskAssessmentCriteria: Boolean;

  @Column
  @Field(() => Boolean, {nullable: true })
  enableProtectedAndIndigenousAreas: Boolean;

  @Column
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  enableRiskWarningPopupNotifications: boolean;

  @Column
  @Field(() => Boolean, { nullable: true, defaultValue: true })
  enableOnScreenRiskWarnings: boolean;


  @Column({ type: DATE})
  @Field(() => Date, { nullable:true, defaultValue:null })
  blockchainPublishDate:Date

  @HasMany(() => RequestAdditionalInformation, { foreignKey: 'dueDiligenceReportId' })
  @Field(() => [RequestAdditionalInformation], { nullable: true, defaultValue: [] })
  requestAdditionalInformation: RequestAdditionalInformation[];

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
  @Field(() => UploadedGeoJSONFile, { nullable: true })
  uploadedGeoJSONFiles: UploadedGeoJSONFile;

  @Column
  @Field(() => String, {nullable: true })
  comments: string

  @Column
  @Field(() => String, {nullable: true })
  eudrVerificationNo: string
  
  @Column
  @Field(() => Boolean, {nullable: true })
  isGeolocationPrivate: boolean

  @Column
  @Field(() => Boolean, {nullable: true })
  is_dds_status_update: boolean

  @Column
  @Field(() => Boolean, {nullable : true})
  is_report_concluded:boolean

  @Column({
    allowNull: true,
    type: DataType.STRING,
  })
  @Field(() => String, { nullable: true })
  statusLegends: string;

  @Column
  @Field(() => Boolean, {nullable: true })
  isTemporaryApproval: boolean;

  @Column
  @Field(() => Date, {nullable: true })
  temporaryExpirationDate: Date;

  @Column
  @Field(() => Int, {nullable: true })
  temporaryExpirationValue: number;

  @Column
  @Field(() => String, {nullable: true })
  temporaryExpirationUnit: string;

  @Column
  @Field(() => Int, {nullable: true })
  assignedTo: number;

  @ForeignKey(() => User)
  @Column
  @Field(() => Int, {nullable: true })
  assignedToCfId: number;

  @BelongsTo(() => User, { foreignKey: 'assignedTo', targetKey: 'id', as: 'assignedToUser' })
  @Field(() => User, { nullable: true })
  assignedToUser: User;

  @Column
  @Field(() => Date, {nullable: true })
  assignedDate: Date;

  @Column
  @Field(() => Date, {nullable: true })
  approvedDate: Date;

  @Column
  @Field(() => Int, {nullable: true })
  processingTimeInDays: number;

  @Column
  @Field(() => String, {nullable: true })
  rejectionReason: string;
}

@ObjectType()
export class RiskWarning {
  @Field(() => Number)
  id: number;

  @Field(() => Number)
  count: number;

  @Field(() => String)
  assessmentName: string;

  @Field(() => Number)
  currentStep?: number;
}

@ObjectType()
export class DiligenceReportWithAnalytic extends DiligenceReport {
  @Field(() => Number, { nullable: true })
  polygonProductionPlaces: number;

  @Field(() => Number, { nullable: true })
  pointProductionPlaces: number;

  @Field(() => Number, { nullable: true })
  totalArea: number;

  @Field(() => Number, { nullable: true })
  totalProductionPlaces: number;

  @Field(() => Number, { nullable: true })
  totalHighDeforestationProductionPlaces: number;

  @Field(() => Number, { nullable: true })
  totalUnknownDeforestationProductionPlaces: number;

  @Field(() => Number, { nullable: true })
  totalDeforestationAssessments: number;

  @Field(() => [RiskWarning], { defaultValue: [] })
  riskWarnings: RiskWarning[];
}

@ObjectType()
export class DiligenceReportStatusSummary {
  @Field(() => String)
  statusLegend: string;

  @Field(() => Int)
  count: number;

  @Field(() => Float, { nullable: true })
  percentage: number;
}

@ObjectType()
export class DiligenceReportProductSummary {
  @Field(() => String)
  productName: string;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class AverageProcessingTimeSummary {
  @Field(() => String)
  employeeName: string;

  @Field(() => Float)
  averageProcessingTimeInDays: number;

  @Field(() => Int)
  totalReportsProcessed: number;
}

@ObjectType()
export class AverageProcessingTimeResponse {
  @Field(() => [AverageProcessingTimeSummary])
  employees: AverageProcessingTimeSummary[];

  @Field(() => Float)
  overallAverageProcessingTimeInDays: number;

  @Field(() => Int)
  totalReportsProcessed: number;
}
