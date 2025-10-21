import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { RiskMitigationFiles } from 'src/due-diligence/production-place/entities/risk-mitigation-files.entity';
import { DiligenceReportProductionPlace } from './diligence-report-production-place.entity';

@Table({ tableName: 'diligence_reports_places_risk_mitigation_files', timestamps: false, })
@ObjectType()
export class DiligenceReportPlaceMitigationFile extends Model {
  @ForeignKey(() => RiskMitigationFiles)
  @Column({ references: { model: 'risk_mitigation_files', key: 'id' } })
  @Field(() => Int)
  riskMitigationFileId: number;

  @ForeignKey(() => DiligenceReportProductionPlace)
  @Column
  @Field(() => Int)
  diligenceReportProductionPlaceId: number;
}
