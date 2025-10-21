import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import { Column, CreatedAt, DataType, HasMany, HasOne, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { AssessmentType } from '../dto/AssessmentType';
import { AssessmentSetting } from './assessment-setting.entity';
import { AssessmentSelectedUser } from './assessment-users.entity';
import { AssessmentStatus } from '../dto/AssessmentStatus';
import { AssessmentQuestions } from './assessment-questions.entity';
import { AssessmentQuestionHeading } from './assessment-question-headings.entity';
import { AssessmentSurvey } from './assessment-survey.entity';

@ObjectType()
@Table({ tableName: "assessments" })
export class Assessment extends Model {
  @Column({ autoIncrement: true, primaryKey: true, allowNull: false })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, type: DataType.INTEGER, field: "org_id", })
  @Field(() => Int, { nullable: true })
  orgId: number;

  @Column({ allowNull: true, type: DataType.INTEGER, field: "subOrganizationId", })
  @Field(() => Int, { nullable: true })
  subOrganizationId: number;

  @Column({ allowNull: true, type: DataType.INTEGER, field: "user_id", })
  @Field(() => Int, { nullable: true })
  userId: number;

  @Column({ allowNull: true, field: "title" })
  @Field(() => String, { nullable: true })
  title: string;

  @Column({ allowNull: true, type: DataType.JSON, field: "countries" })
  @Field(() => [String], { nullable: true, defaultValue: [] })
  countries: string[];

  @Column({ type: DataType.TEXT, allowNull: true, field: "description" })
  @Field(() => String, { nullable: true })
  description: string;

  @Column({ allowNull: false, field: 'assessment_type', defaultValue: AssessmentType.DEFAULT_DIMITRA })
  @Field(() => String, {
    nullable: true,
    defaultValue: AssessmentType.DEFAULT_DIMITRA,
  })
  assessmentType: AssessmentType;

  @Field(() => Number, { nullable: true, defaultValue: false })
  totalHeadings: number;

  @Field(() => Number, { nullable: true, defaultValue: false })
  totalQuestions: number;

  @Column({ allowNull: true, field: "no_of_question", type: DataType.INTEGER, defaultValue: 0 })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  noOfQuestions: number;

  @Column({ allowNull: true, field: "no_of_response", type: DataType.INTEGER, defaultValue: 0 })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  noOfResponse: number;

  @Column({ allowNull: true, field: "status", defaultValue: AssessmentStatus.IN_ACTIVE })
  @Field(() => String, { nullable: true, defaultValue: AssessmentStatus.IN_ACTIVE })
  status: AssessmentStatus;

  @Column({ field: "is_applicable_to_selected_users_only", defaultValue: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isApplicableToSelectedUsersOnly: boolean;

  @Field(() => [AssessmentSelectedUser], { nullable: true })
  @HasMany(() => AssessmentSelectedUser, {
    onDelete: 'CASCADE',
    hooks: true
  })
  assessmentSelectedUsers: AssessmentSelectedUser[];

  @Field(() => [AssessmentQuestions], { nullable: true })
  @HasMany(() => AssessmentQuestions, { as: 'assessmentQuestions' })
  assessmentQuestions: AssessmentQuestions[]

  @Field(() => [AssessmentQuestionHeading], { nullable: true })
  @HasMany(() => AssessmentQuestionHeading, { as: 'assessmentQuestionHeading' })
  assessmentQuestionHeading: AssessmentQuestionHeading[]

  @HasOne(() => AssessmentSetting)
  @Field(() => AssessmentSetting, { nullable: true })
  assessmentSettings: AssessmentSetting;

  @Column({ field: "is_deleted", defaultValue: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDeleted: boolean;

  @Column({ field: "is_default", defaultValue: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isDefault: boolean;

  @HasMany(() => AssessmentSurvey)
  surveys: AssessmentSurvey[];
  
  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
