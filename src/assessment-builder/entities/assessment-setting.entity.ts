import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Assessment } from "./assessment.entity";
import { MultiStepAssessmentType } from "../dto/MultiStepAssessmentType";
import { AllowMultipleEntries } from "../dto/AllowMultipleEntries";

@ObjectType()
@Table({ tableName: "assessment_settings", timestamps: false })
export class AssessmentSetting extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ type: DataType.INTEGER, field: "assessment_id" })
  @ForeignKey(() => Assessment)
  @Field(() => Assessment)
  assessmentId: number;

  @Column({ allowNull: true, field: "expiry_date" })
  @Field(() => String, { nullable: true })
  expiryDate: string;

  @Column({ allowNull: true, field: "expiry_period" })
  @Field(() => String, { nullable: true })
  expiryPeriod: string; // Store expiry duration in MS

  @Column({ field: "is_scheduled", defaultValue: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isScheduled: boolean;

  @Column({ allowNull: true, field: "scheduled_date" })
  @Field(() => String, { nullable: true })
  scheduleDate: string;

  @Column({ allowNull: true, field: "scheduled_end_date" })
  @Field(() => String, { nullable: true })
  scheduledEndDate: string;

  @Column({ field: "is_multi_step", defaultValue: false })
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isMultiStep: boolean;

  @Column({
    allowNull: true,
    field: "multi_step_type",
    defaultValue: MultiStepAssessmentType.QUESTIONS,
  })
  @Field(() => String, {
    nullable: true,
    defaultValue: MultiStepAssessmentType.QUESTIONS,
  })
  multiStepType: MultiStepAssessmentType;

  @Column({
    allowNull: true,
    field: "no_of_questions",
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  noOfQuestion: number;

  // @Column({
  //   allowNull: true,
  //   field: "no_of_headings",
  //   type: DataType.INTEGER,
  //   defaultValue: 0,
  // })
  // @Field(() => Int, { nullable: true, defaultValue: 0 })
  // noOfHeadings: number;

  @Column({ allowNull: true, field: "allow_multiple_entries" })
  @Field(() => String, { nullable: true })
  allowMultipleEntries: AllowMultipleEntries;
}
