import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, ForeignKey } from 'sequelize-typescript';
import { DiligenceReport } from './diligence-report.entity';
import { AssessmentSurvey } from 'src/assessment-builder/entities/assessment-survey.entity';
import { DiligenceReportProductionPlace } from './diligence-report-production-place.entity';

@Table({ tableName: 'diligence_reports_assessment_surveys', timestamps: false })
@ObjectType()
export class DiligenceReportAssessmentSurveys extends Model {
  @ForeignKey(() => DiligenceReport)
  @Column
  @Field(() => Int)
  diligenceReportId: number;

  @ForeignKey(() => AssessmentSurvey)
  @Column
  @Field(() => Int)
  assessmentSurveyId: number;

  @ForeignKey(() => DiligenceReportProductionPlace)
  @Column
  @Field(() => Int, { nullable: true })
  diligenceReportProductionPlaceId: number;
}
