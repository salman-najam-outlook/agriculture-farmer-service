import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt, BelongsToMany } from 'sequelize-typescript';
import { DiligenceReport } from './diligence-report.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { Geofence } from 'src/geofence/entities/geofence.entity';
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { AssessmentProductionPlace } from 'src/assessment-builder/entities/assessment-production-place.entity';
import { ReportPlaceAssessmentProductionPlace } from './diligence-report-place-assessment-production-place.entity';
import { AssessmentUploads } from 'src/assessment-builder/entities/assessment-uploads.entity';
import { DiligenceReportAssessmentUpload } from './diligence-report-assessment-upload.entity';
import { DiligenceReportPlaceMitigationFile } from './diligence-report-mitigation-file.entity';
import { RiskMitigationFiles } from 'src/due-diligence/production-place/entities/risk-mitigation-files.entity';

@Table({ tableName: 'diligence_reports_due_diligence_production_places', timestamps: true })
@ObjectType()
export class DiligenceReportProductionPlace extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @ForeignKey(() => Farm)
  @Column({ references: { model: 'user_farms', key: 'id' } })
  @Field(() => Int)
  farmId: number;

  @BelongsTo(() => Farm, 'farmId')
  @Field(() => Farm)
  farm: Farm;

  @ForeignKey(() => DiligenceReport)
  @Column({ references: { model: 'diligence_reports', key: 'id' } })
  @Field(() => Int)
  diligenceReportId: number;

  @BelongsTo(() => DiligenceReport, 'diligenceReportId')
  @Field(() => DiligenceReport)
  diligenceReport: DiligenceReport;

  @ForeignKey(() => DueDiligenceProductionPlace)
  @Column({ references: { model: 'due_diligence_production_places', key: 'id' } })
  @Field(() => Int)
  dueDiligenceProductionPlaceId: number;

  @BelongsTo(() => DueDiligenceProductionPlace, 'dueDiligenceProductionPlaceId')
  @Field(() => DueDiligenceProductionPlace)
  productionPlace: DueDiligenceProductionPlace;

  @ForeignKey(() => Geofence)
  @Column({ references: { model: 'geofences', key: 'id' } })
  @Field(() => Int)
  geofenceId: number;

  @BelongsTo(() => Geofence, 'geofenceId')
  @Field(() => Geofence)
  geofence: Geofence;

  @Column
  @Field(() => Boolean)
  isDisregarded: boolean;

  @Column
  @Field(() => Boolean)
  removed: boolean;

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
  @Field(() => [String], { nullable: true, defaultValue: [] })
  warnings: string[];

  @Column({ references: { model: 'production_place_deforestation_info', key: 'id' } })
  @Field(() => Int, { nullable: true })
  productionPlaceDeforestationInfoId: number;

  @BelongsTo(() => ProductionPlaceDeforestationInfo, 'productionPlaceDeforestationInfoId')
  @Field(() => ProductionPlaceDeforestationInfo, { nullable: true })
  productionPlaceDeforestationInfo: ProductionPlaceDeforestationInfo;

  @CreatedAt
  @Field(() => String, { nullable: true })
  public createdAt: Date;

  @UpdatedAt
  @Field(() => String, { nullable: true })
  public updatedAt: Date;

  @BelongsToMany(() => AssessmentProductionPlace, () => ReportPlaceAssessmentProductionPlace)
  @Field(() => [AssessmentProductionPlace], { defaultValue: [] })
  all_risk_assessments: AssessmentProductionPlace[];

  @BelongsToMany(() => AssessmentUploads, () => DiligenceReportAssessmentUpload)
  @Field(() => [AssessmentUploads], { defaultValue: [] })
  assessmentUploads: AssessmentUploads[];

  @BelongsToMany(() => RiskMitigationFiles, () => DiligenceReportPlaceMitigationFile)
  @Field(() => [RiskMitigationFiles], { defaultValue: [] })
  riskMitigationFiles: RiskMitigationFiles[];
  
  @Column({ allowNull: true, field: "isEdit" })
  @Field(() => Boolean, { nullable: true })
  isEdit: boolean;

  @Column({ allowNull: true, field: "isVerified" })
  @Field(() => Boolean, { nullable: true })
  isVerified: boolean;
}
