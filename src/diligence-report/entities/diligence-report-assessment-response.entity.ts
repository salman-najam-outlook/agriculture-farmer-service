import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { DiligenceReport } from './diligence-report.entity';
import { AssessmentResponse } from 'src/assessment-builder/entities/assessment-response.entity';

@Table({ tableName: 'diligence_reports_assessment_responses', timestamps: false})
@ObjectType()
export class DiligenceReportAssessmentResponse extends Model {
  @ForeignKey(() => DiligenceReport)
  @Column
  @Field(() => Int)
  diligenceReportId: number;

  @ForeignKey(() => AssessmentResponse)
  @Column
  @Field(() => Int)
  assessmentResponseId: number;
}
