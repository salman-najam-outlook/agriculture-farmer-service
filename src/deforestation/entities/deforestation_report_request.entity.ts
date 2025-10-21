import { Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Farm } from "src/farms/entities/farm.entity";
import { DeforestrationSateliteResponse } from "./deforestation_satelite_response.entity";
import { ReportRequestCoordinates } from "./request-coordinates.entity";
import { ReportStatus, ReportType } from "../dto/create-deforestation.input";
import { User } from "src/users/entities/user.entity";
import { DeforestationMetric } from '../models/deforestation-metric';
import { CONSTANT } from 'src/config/constant';
import { camelCase } from 'lodash';

@ObjectType()
@Table({ tableName: "deforestation_report_requests" })
export class DeforestationReportRequest extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, field: "orgId" })
  @Field(() => String, { nullable: true })
  orgId: string;

  @Column({ allowNull: true, field: "farmer_UUID" })
  @Field(() => String, { nullable: true })
  farmerUUID: string;

  @Column({ allowNull: true, field: "errorStatus" })
  @Field(() => String, { nullable: true })
  errorStatus: string;

  @Column({ allowNull: true, field: "farm_UUID" })
  @Field(() => String, { nullable: true })
  farmUUID: string;

  @Column({ allowNull: true, field: "farmerName" })
  @Field(() => String, { nullable: true })
  farmerName: string;

  @Column({ allowNull: true, field: "farmName" })
  @Field(() => String, { nullable: true })
  farmName: string;

  @Column({ allowNull: true, field: "farmerRegistrationId" })
  @Field(() => String, { nullable: true })
  farmerRegistrationId: string;

  @Column({ allowNull: true, field: "farmRegistrationId" })
  @Field(() => String, { nullable: true })
  farmRegistrationId: string;

  @Column({ allowNull: true, field: "farm_id" })
  @ForeignKey(() => Farm)
  @Field(() => String, { nullable: true })
  farmId: string;

  @BelongsTo(() => Farm)
  @Field(() => Farm, { nullable: true })
  farm: Farm;

  @Column({ allowNull: true, field: "user_id" })
  @Field(() => String, { nullable: false })
  userId: string;

  @Column({ allowNull: false, field: "location_name" })
  @Field(() => String, { nullable: false })
  locationName: string;

  @Column({ allowNull: true, field: "zone_name" })
  @Field(() => String, { nullable: true })
  zoneName: string;

  @Column({ allowNull: true, field: "zoneId" })
  @Field(() => String, { nullable: true })
  zoneId: string;

  @Column({ allowNull: true, field: "report_guid" })
  @Field(() => String, { nullable: true })
  reportGuid: string;

  @Column({ allowNull: true, field: "transaction_hash" })
  @Field(() => String, { nullable: true })
  transactionHash: string;

  @Column({ allowNull: true, field: "keccak_hash" })
  @Field(() => String, { nullable: true })
  keccakHash: string;

  @Field(() => Boolean, { defaultValue: false })
  storedInBlockchain: boolean;

  @Field(() => String, { nullable: true })
  etherScanLink: string;

  @Field(() => String, { nullable: true })
  qrCode: string;

  @Column({ allowNull: false, field: "country" })
  @Field(() => String, { nullable: false })
  country: string;

  @Column({ allowNull: false, field: "state" })
  @Field(() => String, { nullable: false })
  state: string;

  @Column({ allowNull: true, field: "highProb", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  highProb: number;

  @Column({ allowNull: true, field: "highProbPercent", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  highProbPercent: number;

  @Column({ allowNull: true, field: "highProbColor", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  highProbColor: string;

  @Column({ allowNull: true, field: "highProbColorName", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  highProbColorName: string;

  @Column({ allowNull: true, field: "lowProb", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  lowProb: number;

  @Column({ allowNull: true, field: "lowProbColor", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  lowProbColor: string;

  @Column({ allowNull: true, field: "lowProbColorName", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  lowProbColorName: string;

  @Column({ allowNull: true, field: "mediumProb", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  mediumProb: number;

  @Column({ allowNull: true, field: "mediumProbColor", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  mediumProbColor: string;

  @Column({ allowNull: true, field: "mediumProbColorName", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  mediumProbColorName: string;

  @Column({ allowNull: true, field: "veryHighProb", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  veryHighProb: number;

  @Column({ allowNull: true, field: "veryHighProbColor", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  veryHighProbColor: string;

  @Column({ allowNull: true, field: "veryHighProbColorName", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  veryHighProbColorName: string;

  @Column({ allowNull: true, field: "veryLowProb", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  veryLowProb: number;

  @Column({ allowNull: true, field: "veryLowProbColor", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  veryLowProbColor: string;

  @Column({ allowNull: true, field: "veryLowProbColorName", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  veryLowProbColorName: string;

  @Column({ allowNull: true, field: "mediumProbPercent", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  mediumProbPercent: number;

  @Column({ allowNull: true, field: "veryHighProbPercent", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  veryHighProbPercent: number;

  @Column({ allowNull: true, field: "veryLowProbPercent", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  veryLowProbPercent: number;

  @Column({ allowNull: true, field: "lowProbPercent", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  lowProbPercent: number;

  @Column({ allowNull: true, field: "totalArea", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  totalArea: number;

  @Column({ allowNull: true, field: "zeroProb", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  zeroProb: number;

  @Column({ allowNull: true, field: "zeroProbPercent", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  zeroProbPercent: number;

  @Column({ allowNull: true, field: "zeroProbColor", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  zeroProbColor: string;

  @Column({ allowNull: true, field: "zeroProbColorName", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  zeroProbColorName: string;

  @Column({ allowNull: true, field: "overallProb", type: DataType.STRING })
  @Field(() => String, { nullable: true })
  overallProb: string;

  @Column({ allowNull: true, field: "center_latitude", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  centerLatitude: number;

  @Column({ allowNull: true, field: "treeUnchanged", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  treeUnchanged: number;

  @Column({
    allowNull: true,
    field: "treeUnchangedPercent",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true })
  treeUnchangedPercent: number;

  @Column({ allowNull: true, field: "center_longitude", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  centerLongitude: number;

  @Column({ allowNull: true, field: "geofence_area", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  geofenceArea: number;

  @Column({
    allowNull: true,
    field: "deforestation_percent",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  deforestationPercent: number;

  @Column({
    allowNull: true,
    field: "deforestation_area",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  deforestationArea: number;

  @Column({
    allowNull: true,
    field: "tree_gain_percent",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  treeGainPercent: number;

  @Column({
    allowNull: true,
    field: "tree_gain_area",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  treeGainArea: number;

  @Column({
    allowNull: true,
    field: "forest_area_2020",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  forestArea2020: number;

  @Column({
    allowNull: true,
    field: "forest_area_2020_percent",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  forestArea2020Percent: number;

  @Column({
    allowNull: true,
    field: "final_forest_area",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  forestArea2022: number;

  @Column({
    allowNull: true,
    field: "final_forest_area_percent",
    type: DataType.FLOAT,
  })
  @Field(() => Float, { nullable: true, defaultValue: 0 })
  forestArea2022Percent: number;

  @Field(() => [ReportRequestCoordinates], { nullable: true })
  @HasMany(() => ReportRequestCoordinates, {
    onDelete: "CASCADE",
    hooks: true,
  })
  coordinates: ReportRequestCoordinates[];

  @Field(() => [DeforestrationSateliteResponse], { nullable: true })
  @HasMany(() => DeforestrationSateliteResponse, {
    onDelete: "CASCADE",
    hooks: true,
    foreignKey: 'report_request_id'
  })
  sateliteResponse: DeforestrationSateliteResponse[];

  @Column({ field: "is_deleted", defaultValue: false })
  @Field(() => Boolean, { defaultValue: false })
  isDeleted: boolean;

  @Column({ field: "isCertified", defaultValue: false })
  @Field(() => Boolean, { defaultValue: false })
  isCertified: boolean;

  @Column({ field: "isCertificateReady", defaultValue: false })
  @Field(() => Boolean, { defaultValue: false })
  isCertificateReady: boolean;

  @Column({ allowNull: false, defaultValue: ReportStatus.REQUESTED })
  @Field(() => String, {
    nullable: false,
    defaultValue: ReportStatus.REQUESTED,
  })
  status: ReportStatus;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  referenceEndDate: string;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  referenceStartDate: string;

  @Column({ allowNull: false, defaultValue: ReportType.REGISTEREDFARM })
  @Field(() => String, {
    nullable: false,
    defaultValue: ReportType.REGISTEREDFARM,
  })
  reportType: ReportType;

  @Column({ allowNull: true, field: "radius", type: DataType.FLOAT })
  @Field(() => Float, { nullable: true })
  radius: number;

  @Column({ allowNull: true, field: "reportVersion" })
  @Field(() => String, { nullable: true })
  reportVersion: string;

  @Column({ allowNull: true, field: "modelVersion" })
  @Field(() => String, { nullable: true })
  modelVersion: string;

  @Column({ allowNull: true, field: "geometryType" })
  @Field(() => String, { nullable: true })
  geometryType: string;

  @Column({ allowNull: true, field: "title" })
  @Field(() => String, { nullable: true })
  title: string;

  @Column({ allowNull: true, field: "issueDate" })
  @Field(() => String, { nullable: true })
  issueDate: string;

  @Column({ allowNull: true, field: "circularDataSHA256" })
  @Field(() => String, { nullable: true })
  circularDataSHA256: string;

  @Column({ allowNull: true, field: "polygonalDataSHA256" })
  @Field(() => String, { nullable: true })
  polygonalDataSHA256: string;

  @CreatedAt
  @Column({ allowNull: true, field: "created_at" })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true, field: "updated_at" })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      const overallProb: string | null = this.getDataValue('originalOverallProb')?.toLowerCase() || this.getDataValue('overallProb')?.toLowerCase();
      if(!overallProb) return null;
      const config = CONSTANT.DEFORESTATION_STATUS_CONFIG.find(config => overallProb.startsWith(config.label.split('/')[0].toLowerCase()));
      if(!config) return null;
      return this.getDataValue(`${camelCase(config.label.split('/')[0])}ProbColor`) || config.colorCode;
    }
  })
  @Field(() => String, { nullable: true })
  overallProbColorCode: string | null;

  @Column({ allowNull: true, field: "originalOverallProb" })
  @Field(() => String, { nullable: true })
  originalOverallProb?: string | null;

  @Column({
    type: DataType.VIRTUAL,
    get() {
      const metrics: DeforestationMetric[] = [];

      CONSTANT.DEFORESTATION_STATUS_CONFIG.forEach(config => {
        const key = camelCase(config.label.split('/')[0]);
        const percent = this.getDataValue(`${key}ProbPercent`);
        if(typeof percent === 'number') {
          metrics.push({
            label: config.label,
            colorCode: this.getDataValue(`${key}ProbColor`) || config.colorCode,
            colorName: this.getDataValue(`${key}ProbColorName`) || config.colorName,
            percent,
            area: this.getDataValue(`${key}Prob`) ?? 0,
            description: config.description,
          })
        }
      });

      return metrics;
    }
  })
  @Field(() => [DeforestationMetric], { nullable: false })
  metrics: DeforestationMetric[]

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  parentGuid?: string;

  @Field(() => [DeforestationReportRequest], { nullable: true })
  @HasMany(() => DeforestationReportRequest, {
    sourceKey: "reportGuid",
    foreignKey: "parentGuid",
    hooks: true,
    constraints: false,
    foreignKeyConstraint: false,
  })
  childReports?: DeforestationReportRequest[];
}
