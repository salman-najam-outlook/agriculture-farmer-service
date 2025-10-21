import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType
} from 'sequelize-typescript';
import { Directive, Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { FLOAT, ENUM, INTEGER, STRING, DATE, DOUBLE, TINYINT } from 'sequelize';


@Table({ tableName: 'options' })
@Directive('@key(fields: "id")')
@ObjectType()
export class Option extends Model {
  @Column({ primaryKey: true, type: INTEGER })
  @Field(() => ID, {nullable: true})
  id: number;
  
  @Column({ type: STRING})
  @Field(() => String, {nullable: false })
  name: string;
  
  @Column({ type: STRING})
  @Field(() => String, {nullable: false })
  groupName: string;
  
  @Column({ type: STRING})
  @Field(() => String, {nullable: undefined })
  recordId: string;
  
  @Column({ type: STRING})
  @Field(() => String, {nullable: undefined })
  info: string;
  
  @Column({ type: DATE})
  @Field(() => Date, {nullable: false })
  createdAt: Date;
  
  @Column({ type: DATE})
  @Field(() => Date, {nullable: false })
  updatedAt: Date;
}
