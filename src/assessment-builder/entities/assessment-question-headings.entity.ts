import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from "sequelize-typescript";
import { Assessment } from "./assessment.entity";
import { AssessmentQuestions } from "./assessment-questions.entity";

@ObjectType()
@Table({ tableName: "assessment_question_headings", timestamps: false, paranoid: true })
export class AssessmentQuestionHeading extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;


  @Column({ type: DataType.INTEGER, field: "assessment_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => Assessment)
  assessmentId: number;

  @Column({ allowNull: true, field: "title" })
  @Field(() => String, { nullable: true })
  title: string;

  @Column({ type: DataType.INTEGER, field: "order" })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  order: number;

  @Field(() => [AssessmentQuestions], { nullable: true })
  @HasMany(() => AssessmentQuestions, {
    onDelete: 'CASCADE',
    hooks: true
  })
  assessmentQuestions: AssessmentQuestions[];

}
