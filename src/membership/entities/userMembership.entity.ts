import { ObjectType, Field, Int, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import {
  Table,
  Column,
  Model,
  ForeignKey,
  HasOne,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Membership } from './membership.entity';
import { Payments } from './payment.entity';

@Table({ tableName: 'users_memberships' })
@ObjectType()
export class UserMembership extends Model {

  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { nullable: true })
  id: number
  
  @Column({ type: INTEGER })
  @ForeignKey(() => User)
  @Field(() => User)
  user_id: number;
  
  @Column({ type: INTEGER })
  @ForeignKey(() => Membership)
  @Field(() => Int, { nullable: true })
  membership_id: number;

  @Column({ type: INTEGER })
  @ForeignKey(() => Payments)
  @Field(() => Int, { nullable: true })
  payment_id: number;

  @BelongsTo(() => Membership)
  @Field(() => Membership, { nullable: true })
  membershipData: Membership

  @Column
  @Field(() => GraphQLISODateTime, { nullable: true })
  start_date: Date;

  @Column
  @Field(() => GraphQLISODateTime, { nullable: true })
  end_date: Date;

  @Column
  @Field(() => Boolean)
  active: boolean
}
