import { ObjectType, Field, Int, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import { Column, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';
import { PaymentMethods } from './payment-methods.entity';
import { User } from 'src/users/entities/user.entity';
import { UserMembership } from './userMembership.entity';

@Table({ tableName: 'payments' })
@ObjectType()
export class Payments extends Model  {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { nullable: true })
  id: number

  @Column({ type: INTEGER })
  @ForeignKey(() => User)
  @Field(() => User)
  user_id: number;
  
  @Column
  @ForeignKey(() => PaymentMethods)
  @Field(() => PaymentMethods, {nullable: true })
  payment_method: number;
  
  @Column
  @Field(() => String, {nullable: true })
  transaction_id: string;

  @Column
  @Field(() => String, {nullable: true })
  status: string;

  @Column
  @Field(() => Int, {nullable: true })
  amount: number;

  @Column
  @Field(() => String, {nullable: true })
  currency: string;

  @Column
  @Field(() => String, {nullable: true })
  payment_note: string;

  @Column
  @Field(() => GraphQLISODateTime, { nullable: true })
  payment_date: Date

  @Column
  @Field(() => Boolean)
  is_refund: boolean

  @Column
  @Field(() => String, {nullable: true })
  payer_info: string;
}
