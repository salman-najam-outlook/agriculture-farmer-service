import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from 'sequelize-typescript';
import { Directive, Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { FLOAT, ENUM, INTEGER, STRING, DATE, DOUBLE, TINYINT } from 'sequelize';
import { User } from 'src/users/entities/user.entity';


@Table({ tableName: 'farm_upload_history' })
@Directive('@key(fields: "id")')
@ObjectType()
export class FarmUploadHistory extends Model {

  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  numberOfRowsFailed: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  numberOfRowsInserted: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  fileName: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  key: string;

  @ForeignKey(() => User)
  @Column({ allowNull: true, type: DataType.INTEGER })
  @Field(() => Int, { nullable: true })
  userId: number;

  //errors JSO

  @Column({ type: DATE })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
