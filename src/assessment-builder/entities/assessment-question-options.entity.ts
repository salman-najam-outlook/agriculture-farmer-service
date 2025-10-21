import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { AssessmentQuestions } from "./assessment-questions.entity";
import { AssessmentOptionsAndSubQuestionsMapping } from "./assessments-options-and-sub-questions-mapping.entity";

@ObjectType()
@Table({ tableName: "assessment_question_options", timestamps: false, paranoid: true })
export class AssessmentQuestionOptions extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, field: "label" })
  @Field(() => String, { nullable: true })
  label: string;

  @Column({ allowNull: true, field: "value" })
  @Field(() => String, { nullable: true })
  value: string;

  @Column({
    allowNull: true,
    type: DataType.JSON,
    field: "checklists",
    defaultValue: [],
  })
  @Field(() => [String], {
    nullable: true, defaultValue:[]
  })
  checklists: string[];


  @Column({ type: DataType.INTEGER, field: "assessment_question_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => AssessmentQuestions)
  assessmentQuestionId: number;


  @Field(() => [AssessmentQuestions], { nullable: true })
  @BelongsToMany(() => AssessmentQuestions, {
    through: () => AssessmentOptionsAndSubQuestionsMapping,
    foreignKey: 'optionId',
    otherKey: 'subQuestionId',
  })
  subQuestions: AssessmentQuestions[];


}
