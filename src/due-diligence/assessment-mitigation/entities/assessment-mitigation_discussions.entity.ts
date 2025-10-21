import { ObjectType, Field, Directive, ID, Int } from "@nestjs/graphql";
import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  HasMany,
} from "sequelize-typescript";
import { AssessmentMitigation } from "./assessment-mitigation.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import { AssessmentMitigationAttachments } from "./assessment-mitigation_attachments.entity";

@Table({ tableName: "assessment_question_mitigation_discussions",  paranoid: true, timestamps: true   })
@ObjectType()
export class AssessmentMitigationDiscussions extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: "id" })
    id: number;
  
    @ForeignKey(() => AssessmentMitigation)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "assessment mitigation id" })
    assessmentMitigationId: number;

    @Column({ allowNull: true })
    @Field(() => String, {nullable: true, description: "checklist title" })
    comment: string;

    @Column({ allowNull: true })
    @Field(() => Int, {nullable: true, description: "user" })
    userId: string;

    @BelongsTo(() => User, {foreignKey:'userId', as :'user', targetKey: 'cf_userid'  })
    @Field(() => User, { nullable:true })
    user: User

    @CreatedAt
    public createdAt: Date;
  
    @UpdatedAt
    public updatedAt: Date;
  
    @BelongsTo(() => AssessmentMitigation)
    @Field(() => AssessmentMitigation)
    assessmentMitigation: AssessmentMitigation;
  
    @Field(() => [AssessmentMitigationAttachments], { nullable: true })
    @HasMany(() => AssessmentMitigationAttachments, {
      onDelete: "CASCADE",
      hooks: true,
    })
    attachments: AssessmentMitigationAttachments[];
  }
  