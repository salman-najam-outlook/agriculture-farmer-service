import { Field, Int, ObjectType } from '@nestjs/graphql';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { EudrSetting } from './eudr-setting.entity';

@ObjectType()
@Table({ tableName: 'declaration_statements' })
export class DeclarationStatements extends Model {
  @Field(() => Int)
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @ForeignKey(() => EudrSetting)
  @Column({ allowNull: true, field: 'eudr_settings_id' })
  @Field(() => Int)
  eudr_settings_id: number;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  title: string;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  country: string;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  description: string;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  isEnabled: boolean;

  @CreatedAt
  @Column({ allowNull: true, field: 'createdAt' })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true, field: 'updatedAt' })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}