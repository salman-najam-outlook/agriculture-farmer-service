import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import {
  Table,
  Column,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { Membership } from './membership.entity';

@Table({ tableName: 'membership_fees' })
@ObjectType()
export class MembershipFees extends Model {
  @Column({ primaryKey: true, type: INTEGER })
  @Field(() => ID, {nullable: true})
  id: number;
  
  @Column({ type: INTEGER })
  @ForeignKey(() => Membership)
  @Field(() => Membership)
  membership_id: number;

  @Column
  @Field(() => Int, {nullable: true })
  per_month_fee: number;

  @Column
  @Field(() => Int, {nullable: true })
  per_year_fee: number;

  @Column
  @Field(() => Boolean)
  is_free_trial: boolean

  @Column
  @Field(() => Int, {nullable: true })
  free_trial_period_in_days: number;

  @Column
  @Field(() => Boolean)
  default_status: boolean

  @Column
  @Field(() => Boolean)
  in_use: boolean
}
