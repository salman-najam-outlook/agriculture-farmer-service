import { ObjectType, Field, Int } from "@nestjs/graphql";
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { Assessment } from "./assessment.entity";
import { UserDDS } from "src/users/entities/dds_user.entity";

@ObjectType()
@Table({ tableName: "assessment_selected_users", timestamps: false })
export class AssessmentSelectedUser extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ type: DataType.INTEGER, field: "user_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => UserDDS)
  userId: number;

  @Column({ type: DataType.INTEGER, field: "assessment_id" })
  @Field(() => Int, { nullable: true })
  @ForeignKey(() => Assessment)
  assessmentId: number;

  @BelongsTo(() => UserDDS)
  user: UserDDS;

  @BelongsTo(() => Assessment)
  assessment: Assessment;
}
