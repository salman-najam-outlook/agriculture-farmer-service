import { ObjectType, Field, Int, registerEnumType } from "@nestjs/graphql";
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
import { AssessmentResponse } from "./assessment-response.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { Farm } from "src/farms/entities/farm.entity";
import { UserDDS } from 'src/users/entities/dds_user.entity';


export enum SurveyStatus {
  AVAILABLE = "AVAILABLE",
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED"
}

registerEnumType(SurveyStatus, {
  name: 'SurveyStatus',
  description: "Denotes current status of survey submission"
});

@ObjectType()
@Table({ tableName: "assessment_surveys", paranoid: true, timestamps: true })
export class AssessmentSurvey extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ type: DataType.INTEGER, field: "due_diligence_id" })
  @Field(() => Int, { nullable: true })
  dueDiligenceId: number;

  @Column({ type: DataType.INTEGER, field: "assessment_id" })
  @ForeignKey(() => Assessment)
  @Field(() => Int)
  assessmentId: number;

  @Column({ type: DataType.INTEGER, field: "user_id" })
  @Field(() => Int)
  userId: number;

  @BelongsTo(() => UserDDS, 'userId')
  user: UserDDS;

  @Column({ type: DataType.INTEGER, field: "farm_id" })
  @ForeignKey(() => DueDiligenceProductionPlace)
  @Field(() => Int, { nullable: true, description: "production place" })
  farmId: number;

  @Column({ type: DataType.INTEGER, field: "user_farm_id" })
  @ForeignKey(() => Farm)
  @Field(() => Int, { nullable: true, description: "Farm" })
  userFarmId: number;

  @BelongsTo(() => Farm, 'userFarmId')
  @Field(() => Farm, { nullable: true })
  userFarm: Farm;

  @Column({ type: DataType.STRING})
  @Field(()=>String, { nullable:true })
  signatureS3Key: string;

  @Column({ type: DataType.STRING})
  @Field(()=>String, { nullable:true })
  signatureS3Location: string;

  @Column({ type: DataType.STRING})
  @Field(()=>String, { nullable:true })
  signatureOwner: string;

  @Column({ type: DataType.DATE })
  @Field(()=>Date, { nullable:true })
  signatureCreatedAt: Date;

  @Column({ type: DataType.DATE})
  @Field(()=>Date, { nullable:true })
  expiresOn: Date;

  @Column({ type: DataType.ENUM("AVAILABLE", "IN_PROGRESS", "COMPLETED") })
  @Field(() => SurveyStatus, { nullable: true, defaultValue: SurveyStatus.AVAILABLE })
  status: SurveyStatus;

  @BelongsTo(() => Assessment)
  assessment: Assessment;

  @BelongsTo(() => DueDiligenceProductionPlace)
  productionPlace: DueDiligenceProductionPlace;

  @Field(() => [AssessmentResponse], { nullable: true })
  @HasMany(() => AssessmentResponse, {
    onDelete: "CASCADE",
    hooks: true,
  })
  surveyResponses: AssessmentResponse[];

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(()=> String, { nullable: true})
  riskAssessmentStatus: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(()=> String, { nullable: true})
  originalRiskAssessmentStatus: string;
}
