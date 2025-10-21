import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { AssessmentQuestions } from "./assessment-questions.entity";
import { AssessmentQuestionOptions } from "./assessment-question-options.entity";

@ObjectType()
@Table({ tableName: "assessment_options_and_sub_questions_mappings", timestamps: false, paranoid: true })
export class AssessmentOptionsAndSubQuestionsMapping extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;


  @Column({ type: DataType.INTEGER, field: "parent_question_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => AssessmentQuestions)
  parentQuestionId: number;

  @Column({ type: DataType.INTEGER, field: "option_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => AssessmentQuestionOptions)
  optionId: number;

  @Column({ type: DataType.INTEGER, field: "sub_question_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => AssessmentQuestions)
  subQuestionId: number;
}
