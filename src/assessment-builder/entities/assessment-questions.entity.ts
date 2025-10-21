import { ObjectType, Field, Int, Float } from "@nestjs/graphql";
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from "sequelize-typescript";
import { Assessment } from "./assessment.entity";
import { AssessmentQuestionType } from "../dto/AssessmentQuestionType";
import { DigitalSignatureTypeAdditionalSettings} from "../dto/DigitalSignatureTypeAdditionalSettings";
import { FileTypeAdditionalSettings } from "../dto/FileTypeAdditionalSettings";
import { AssessmentQuestionOptions } from "./assessment-question-options.entity";
import { AssessmentQuestionHeading } from "./assessment-question-headings.entity";

@ObjectType()
@Table({ tableName: "assessment_questions", paranoid: true, timestamps: true  })
export class AssessmentQuestions extends Model {
  @Column({ autoIncrement: true, primaryKey: true, allowNull: false })
  @Field(() => Int)
  id: number;

  @Column({ type: DataType.INTEGER, field: "assessment_id" })
  @ForeignKey(() => Assessment)
  @Field(() => Assessment)
  assessmentId: number;

  @Column({ type: DataType.INTEGER, field: "heading_id", allowNull: true })
  @ForeignKey(() => AssessmentQuestionHeading)
  @Field(() => Int, {nullable: true})
  headingId: number;

  @BelongsTo(() => AssessmentQuestionHeading)
  @Field(() => AssessmentQuestionHeading, { nullable: true })
  heading: AssessmentQuestionHeading;

  @Column({ type: DataType.INTEGER, field: "order", defaultValue: 0 })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  order: number;

  @Column({ allowNull: true, type: DataType.INTEGER, field: "user_id" })
  @Field(() => Int, { nullable: true })
  userId: number;

  @Column({ allowNull: true, field: "title" })
  @Field(() => String, { nullable: true })
  title: string;

  @Column({ allowNull: false, field: "assessment_question_type" })
  @Field(() => String, {
    nullable: false,
  })
  assessmentQuestionType: AssessmentQuestionType;

  @Column({ field: "is_mandatory", defaultValue: false })
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isMandatory: boolean;

  @Column({ field: "is_enabled", defaultValue: false })
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isEnabled: boolean;

  @Column({ field: "has_options", defaultValue: false })
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  hasOptions: boolean;

  @Column({ field: "is_file_type", defaultValue: false })
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isFileType: boolean;

  @Column({
    allowNull: true,
    type: DataType.JSON,
    field: "file_type_additional_settings",
  })
  @Field(() => FileTypeAdditionalSettings, { nullable: true })
  fileTypeAdditionalSettings: FileTypeAdditionalSettings;

  @Column({ field: "is_digital_signature_type", defaultValue: false })
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  isDigitalSignatureType: boolean;

  @Column({
    allowNull: true,
    type: DataType.JSON,
    field: "digital_signature_type_additional_settings",
  })
  @Field(() => DigitalSignatureTypeAdditionalSettings, {
    nullable: true,
  })
  digitalSignatureTypeAdditionalSettings: DigitalSignatureTypeAdditionalSettings;

  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: "parent_question_id",
  })
  @ForeignKey(() => Assessment)
  // @Field(() => AssessmentQuestions, {nullable: true})
  parentQuestionId: number;

  @Field(() => [AssessmentQuestionOptions], { nullable: true })
  @HasMany(() => AssessmentQuestionOptions, {
    onDelete: "CASCADE",
    hooks: true,
  })
  options: AssessmentQuestionOptions[];


  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
