import { ObjectType, Field, Directive, ID, Int } from "@nestjs/graphql";
import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { AssessmentMitigation } from "./assessment-mitigation.entity";

@Table({ tableName: "assessment_question_mitigation_checklists" })
@ObjectType()
export class AssessmentMitigationChecklists extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: "id" })
    id: number;
  
    @ForeignKey(() => AssessmentMitigation)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "assessment mitigation id" })
    assessmentMitigationId: number;

    @Column({ allowNull: true })
    @Field(() => String, {nullable: true, description: "checklist title" })
    checklistTitle: string;

    @Column({ defaultValue: false })
    @Field(() => Boolean, { nullable: true, defaultValue: false })
    isChecked: boolean;

    @CreatedAt
    public createdAt: Date;
  
    @UpdatedAt
    public updatedAt: Date;
  
    @BelongsTo(() => AssessmentMitigation)
    @Field(() => AssessmentMitigation)
    assessmentMitigation: AssessmentMitigation;
  
  }
  