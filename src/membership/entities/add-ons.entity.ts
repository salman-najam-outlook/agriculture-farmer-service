import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'add_ons' })
@ObjectType()
export class Addons extends Model  {
  @Column({ primaryKey: true, type: INTEGER })
  @Field(() => ID, {nullable: true})
  id: number;
  
  @Column
  @Field(() => String, {nullable: false })
  name: string;
  
  @Column
  @Field(() => String, {nullable: true })
  description: string;

  @Column
  @Field(() => Int, {nullable: true })
  per_month_fee: number;

  @Column
  @Field(() => Int, {nullable: true })
  per_year_fee: number;

  @Column
  @Field(() => Boolean)
  default_status: boolean

  @Column
  @Field(() => Boolean)
  in_use: boolean

  @Column
  @Field(() => String, {nullable: true })
  add_on_details: string;
}
