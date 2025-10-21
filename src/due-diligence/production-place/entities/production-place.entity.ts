import {Field, Float, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import {
  BelongsTo,
  BelongsToMany,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Farm } from "src/farms/entities/farm.entity";
import { RiskMitigationFiles } from "./risk-mitigation-files.entity";
import { DiligenceReport } from "src/diligence-report/entities/diligence-report.entity";
import { AssessmentProductionPlace } from "src/assessment-builder/entities/assessment-production-place.entity";
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { ProductionPlaceDeforestationInfo } from './production-place-deforestation-info.entity';
import { DiligenceReportProductionPlace } from 'src/diligence-report/entities/diligence-report-production-place.entity';
import { DueDiligenceProductionPlacesPyData } from "src/deforestation/entities/due_diligence_production_places_py_data.entity";

export enum EudrDeforestationStatus {
  MANUALLY_MITIGATED = "Manually Mitigated",
  VERY_HIGH_DEFORESTATION_PROBABILITY = "Very High Deforestation Probability",
  VERY_HIGH_PROBABILITY = "Very High Probability",
  HIGH_PROBABILITY = "High Probability",
  MEDIUM_DEFORESTATION_PROBABILITY = "Medium Deforestation Probability",
  MEDIUM_PROBABILITY = "Medium Probability",
  LOW_PROBABILITY = "Low Probability",
  VERY_LOW_PROBABILITY = "Very Low Probability",
  VERY_LOW_DEFORESTATION_PROBABILITY = "Very Low Deforestation Probability",
  LOW_DEFORESTATION_PROBABILITY= "Low Deforestation Probability",
  ZERO_NEG_PROBABILITY = "Zero/Negligible Probability",
  HIGH_DEFORESTATION_PROBABILITY = "High Deforestation Probability",
  ZERO_NEGLIGIBLE_DEFORESTATION_PROBABILITY= "Zero/Negligible Deforestation Probability"

}

export enum RiskAssessmentStatus {
  APPROVED = "approved",
  MITIGATION_REQUIRED = "mitigation_required",
  REJECTED = "rejected",
}

registerEnumType(RiskAssessmentStatus, {
  name: 'RiskAssessmentStatus',
  description: 'The status of risk assessment', 
});

@ObjectType()
export class AssessmentData {
  @Field(() => String, {nullable: true})
  probability : string;

  @Field(() => String, {nullable: true})
  color_code : string;

  @Field(() => Number, {nullable: true})
  geofence_area : string;

  @Field(() => Number, {nullable: true})
  area_percentage : string;
}

@ObjectType()
export class WarningObj {
  @Field(() => String, {nullable:true})
  country?:string

  @Field(() => Boolean, {nullable:true} )
  is_ocean?:boolean
}

@Table({ tableName: "due_diligence_production_places", timestamps: true, paranoid: true })
@ObjectType()
export class DueDiligenceProductionPlace extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, type: DataType.INTEGER })
  @Field(() => Int, { nullable: true })
  copyOf: number;

  @ForeignKey(()=>Farm)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, { nullable: false })
  farmId: number;

  @BelongsTo(() => Farm, {foreignKey:'farmId', as:"farm"})
  @Field(() => Farm)
  farm: Farm;

  @ForeignKey(()=>DiligenceReport)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, { nullable: false })
  dueDiligenceReportId: number;

  @Column
  @Field(() => Boolean, { description: "farm removed" })
  removed: boolean;

  @Column({ allowNull: true })
  @Field(() => String, {
    nullable: true,
    description: "risk_mitigation_comment",
  })
  risk_mitigation_comment: string;

  @Column({
    type: DataType.ENUM(
      "Manually Mitigated",
      "Very High Probability",
      "High Probability",
      "Medium Probability",
      "Low Probability",
      "Very Low Probability",
      "Zero/Negligible Probability",
      "Very High Deforestation Probability",
      "High Deforestation Probability",
      "Medium Deforestation Probability",
      "Low Deforestation Probability",
      "Very Low Deforestation Probability",
      "Zero/Negligible Deforestation Probability"
    ),
    allowNull: true,
  })
  @Field(() => String, {
    nullable: true,
    description: "EUDR deforestation status",
  })
  eudr_deforestation_status: EudrDeforestationStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @Field(() => Date, {
    nullable: true,
    description: "EUDR deforestation status generated date",
  })
  deforestationStatusDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @Field(() => Date, {
    nullable: true,
    description: "mitigation date",
  })
  lastMitigatedDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @Field(() => Date, {
    nullable: true,
    description: "dispute resolved date",
  })
  lastDisputeResolvedDate: Date;

  @Column
  @Field(() => String, {nullable: true})
  eudr_s3_key: string;

  @Column
  @Field(() => String, {nullable: true})
  eudr_s3_location: string;

  @Column({
    allowNull:true,
    type:DataType.JSON
  })
  @Field(() => [WarningObj], {nullable: true, defaultValue:[] })
  warnings:WarningObj[];

  @Column
  @Field(() => String, {nullable: true})
  eudr_comment: string;

  @Column({
    type: DataType.ENUM(
        "approved",
        "mitigation_required",
        "rejected"
    ),
    allowNull: true,
  })
  @Field(() => String, {
    nullable: true,
    description: "EUDR deforestation status",
  })
  risk_assessment_status: RiskAssessmentStatus;

  @Column({ allowNull: true, type: DataType.JSONB })
  @Field(() => [AssessmentData], {
    nullable: true,
    description: 'Assessment Data',
  })
  assessment_data: AssessmentData[];

  // disregard_status
  @Column
  @Field(() => Boolean, { description: "disregard status" })
  disregard_status: boolean;

  @BelongsToMany(() => DiligenceReport, () => DiligenceReportProductionPlace, 'dueDiligenceProductionPlaceId', 'diligenceReportId')
  @Field(() => [DiligenceReport], { nullable:true })
  diligenceReports: DiligenceReport[];

  @HasMany(() => RiskMitigationFiles)
  @Field(() => [RiskMitigationFiles], { nullable:true })
  risk_mitigation_files: RiskMitigationFiles[];

  @HasOne(() => AssessmentProductionPlace)
  @Field(() => AssessmentProductionPlace, { nullable:true })
  assessment_production_place: AssessmentProductionPlace;

  @HasMany(() => AssessmentProductionPlace)
  @Field(() => [AssessmentProductionPlace], { nullable:true })
  all_risk_assessments: AssessmentProductionPlace[];

  @HasOne(() => DueDiligenceProductionPlacesPyData)
  @Field(() => DueDiligenceProductionPlacesPyData, { nullable:true })
  dueDiligenceProductionPlacesPyData: DueDiligenceProductionPlacesPyData;

  @CreatedAt
  @Column({ allowNull: true, field: "created_at" })
  @Field(() => Date, { nullable: true })
  createdAt: string;

  @UpdatedAt
  @Column({ allowNull: true, field: "updated_at" })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
  
  @Column({ allowNull: true, field: "isEdit" })
  @Field(() => Boolean, { nullable: true })
  isEdit: boolean;

  @Column({ allowNull: true, field: "isVerified" })
  @Field(() => Boolean, { nullable: true })
  isVerified: boolean;

  @ForeignKey(() => Geofence)
  @Column({ references: { model: 'geofences', key: 'id' } })
  @Field(() => Int)
  latestGeofenceId: number;

  @BelongsTo(() => Geofence, 'latestGeofenceId')
  @Field(() => Geofence)
  latestGeofence: Geofence;

  @ForeignKey(() => ProductionPlaceDeforestationInfo)
  @Column({ references: { model: 'production_place_deforestation_info', key: 'id' } })
  @Field(() => Int, { nullable: true })
  productionPlaceDeforestationInfoId: number;

  @BelongsTo(() => ProductionPlaceDeforestationInfo, 'productionPlaceDeforestationInfoId')
  @Field(() => ProductionPlaceDeforestationInfo, { nullable: true })
  productionPlaceDeforestationInfo: ProductionPlaceDeforestationInfo;
  
  @HasMany(() => DiligenceReportProductionPlace, 'dueDiligenceProductionPlaceId')
  @Field(() => [DiligenceReportProductionPlace], { defaultValue: [] })
  diligenceReportProductionPlaceArray: DiligenceReportProductionPlace[];
}
