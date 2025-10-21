import { ObjectType, Field, Directive, ID, Int, InputType } from "@nestjs/graphql";
import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  DataType,
} from "sequelize-typescript";
import { AssessmentMitigation } from "./assessment-mitigation.entity";
import { AssessmentMitigationDiscussions } from "./assessment-mitigation_discussions.entity";
@ObjectType()
@InputType("FileMetaDataInput")
export class FileMetaData {
  @Field(() => String, { nullable: true })
  key: string
  @Field(() => String, { nullable: true })
  s3Location: string
  @Field(() => String, { nullable: true })
  mimeType: string
  @Field(() => String, { nullable: true })
  size: string
}

@Table({ tableName: "assessment_question_mitigation_attachments", paranoid: true, timestamps: true   })
@ObjectType()
export class AssessmentMitigationAttachments extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: "id" })
    id: number;
  
    @ForeignKey(() => AssessmentMitigation)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "assessment mitigation id" })
    assessmentMitigationId: number;
    
    @ForeignKey(() => AssessmentMitigationDiscussions)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "assessment mitigation discussion id" })
    assessmentMitigationDiscussionId: number;

    @Column({ allowNull: true })
    @Field(() => String, {nullable: true, description: "file path" })
    filePath: string;

    @Column({ allowNull: true,    type: DataType.JSON,    })
    @Field(() => FileMetaData, {nullable: true, })
    fileMetadata: FileMetaData;

    @CreatedAt
    @Field(() => Date, {nullable: true, })
    public createdAt: Date;
  
    @UpdatedAt
    public updatedAt: Date;
  
    @BelongsTo(() => AssessmentMitigation)
    @Field(() => AssessmentMitigation)
    assessmentMitigation: AssessmentMitigation;
  
  }
  