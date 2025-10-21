import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import { Column, Model, Table } from 'sequelize-typescript';

@Table({ tableName: 'payment_methods' })
@ObjectType()
export class PaymentMethods extends Model  {
  @Column({ primaryKey: true, type: INTEGER })
  @Field(() => ID, {nullable: true})
  id: number;
  
  @Column
  @Field(() => String, {nullable: true })
  payment_method: string;
  
}
