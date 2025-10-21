import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { EudrSetting } from "./eudr-setting.entity";

@ObjectType()
@Table({ tableName: "deforestation_assessment_risk_tolerance_levels" })
export class DeforestationAssessmentRiskToleranceLevels extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  very_high: number;

  @Column({ allowNull: true })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  high: number;

  @Column({ allowNull: true })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  medium: number;

  @Column({ allowNull: true })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  low: number;

  @Column({ allowNull: true })
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  very_low: number;

  @Field(() => Int)
  @ForeignKey(() => EudrSetting)
  @Column({ allowNull: true, field: "eudr_settings_id" })
  eudr_settings_id: number;

  @Column({ allowNull: true, field: "createdAt" })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Column({ allowNull: true, field: "updatedAt" })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
