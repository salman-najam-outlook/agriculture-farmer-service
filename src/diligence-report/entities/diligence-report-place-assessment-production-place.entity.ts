import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { AssessmentProductionPlace } from 'src/assessment-builder/entities/assessment-production-place.entity';
import { DiligenceReportProductionPlace } from './diligence-report-production-place.entity';

@Table({ tableName: 'diligence_reports_places_assessment_production_places', timestamps: false })
@ObjectType()
export class ReportPlaceAssessmentProductionPlace extends Model {
  @ForeignKey(() => AssessmentProductionPlace)
  @Column
  @Field(() => Int)
  assessmentProductionPlaceId: number;

  @ForeignKey(() => DiligenceReportProductionPlace)
  @Column
  @Field(() => Int)
  diligenceReportProductionPlaceId: number;
}
