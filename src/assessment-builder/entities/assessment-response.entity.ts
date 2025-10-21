import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { AssessmentResponseObject, QuestionDetail } from "../dto/create-assessment-response.input";
import { AssessmentSurvey } from "./assessment-survey.entity";
import { DiligenceReportAssessmentResponse } from 'src/diligence-report/entities/diligence-report-assessment-response.entity';


@ObjectType()
@Table({ tableName: "assessment_responses", paranoid: true, timestamps:true })
export class AssessmentResponse extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ type: DataType.INTEGER, field: "survey_id" })
  @ForeignKey(() => AssessmentSurvey)
  @Field(() => Int)
  surveyId: number;

  @Column({ type: DataType.INTEGER, field: "question_id" })
  @Field(() => Int)
  questionId: number;

  @Column({ type: DataType.JSON, field: "question_detail" })
  @Field(() => QuestionDetail, { nullable: true })
  questionDetail: QuestionDetail;

  @Column({ type: DataType.JSON, field: "response" })
  @Field(() => AssessmentResponseObject)
  response: AssessmentResponseObject;

  @Column({ field: "is_latest_version_response", defaultValue: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isLatestVersionResponse: boolean;

  @Column({ type: DataType.INTEGER, field: "user_id" })
  @Field(() => Int, {nullable: true})
  userId: number;

  @Column({ type: DataType.INTEGER, field: "submitted_by" })
  @Field(() => Int, {nullable: true})
  submittedBy: number;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @HasMany(() => DiligenceReportAssessmentResponse)
  reportResponseArray: DiligenceReportAssessmentResponse[];
}
