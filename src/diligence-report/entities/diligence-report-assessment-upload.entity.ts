import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { DiligenceReport } from './diligence-report.entity';
import { AssessmentUploads } from 'src/assessment-builder/entities/assessment-uploads.entity';
import { DiligenceReportProductionPlace } from './diligence-report-production-place.entity';

@Table({ tableName: 'diligence_reports_assessment_uploads', timestamps: false })
@ObjectType()
export class DiligenceReportAssessmentUpload extends Model {
  @ForeignKey(() => DiligenceReport)
  @Column
  @Field(() => Int)
  diligenceReportId: number;

  @ForeignKey(() => AssessmentUploads)
  @Column
  @Field(() => Int)
  assessmentUploadId: number;

  @ForeignKey(() => DiligenceReportProductionPlace)
  @Column
  @Field(() => Int, { nullable: true })
  diligenceReportProductionPlaceId: number;
}
