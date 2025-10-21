import { ObjectType, Field, Int, Directive, ID } from '@nestjs/graphql';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';

@Table({ tableName: 'modules' })
@ObjectType()
export class Modules extends Model {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: false })
  @Field(() => String, {})
  id: number;

  @Column
  @Field({ nullable: false })
  name: string;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
