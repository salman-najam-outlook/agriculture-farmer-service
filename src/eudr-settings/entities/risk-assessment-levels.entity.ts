import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { EudrSetting } from './eudr-setting.entity';

@ObjectType()
@Table({ tableName: 'risk_levels' })
export class RiskAssessmentLevels extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  very_high: boolean;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  high: boolean;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  medium: boolean;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  low: boolean;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  zero: boolean;

  @Column({ allowNull: true, defaultValue:true })
  @Field(() => Boolean, { nullable: true })
  very_low: boolean;

  @Field(() => Int)
  @ForeignKey(() => EudrSetting)
  @Column({ allowNull: true, field: 'eudr_settings_id' })
  eudr_settings_id: number;

  // @Field(() => EudrSetting, { nullable: true })
  // @BelongsTo(() => EudrSetting)
  // eudrSetting: EudrSetting

  @Column({ allowNull: true, field: "createdAt" })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Column({ allowNull: true, field: "updatedAt" })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}