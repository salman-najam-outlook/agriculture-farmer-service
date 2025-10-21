import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { Directive, Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { FLOAT, ENUM, INTEGER, STRING, DATE, DOUBLE, TINYINT } from 'sequelize';
import { Option } from './options.entity';
import { Farm } from './farm.entity';


@Table({ tableName: 'user_farm_coordinates' })
@Directive('@key(fields: "id")')
@ObjectType()
export class FarmCoordinates extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  lat: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  log: string;

  @Column
  @Field(() => Int)
  @ForeignKey(() => Farm)
  farmId: number

  @BelongsTo(() => Farm)
  @Field(() => Farm, { nullable: true })
  farmData: Farm

  
  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userId: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userDdsId: number;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
