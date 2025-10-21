import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import { Column, HasMany, HasOne, Model, Table } from 'sequelize-typescript';
import { MembershipFees } from './membership-fees.entity';

@Table({ tableName: 'memberships' })
@ObjectType()
export class Membership extends Model  {
  @Column({ primaryKey: true, type: INTEGER })
  @Field(() => ID, {nullable: true})
  id: number;
  
  @Column
  @Field(() => String, {nullable: true })
  membership_name: string;
  
  @Column
  @Field(() => String, {nullable: true })
  description: string;

  @Column
  @Field(() => Int, {nullable: true })
  no_of_animals: number;

  @Column
  @Field(() => Int, {nullable: true })
  satellite_report: number;

  @Column
  @Field(() => Int, {nullable: true })
  pasture_report: number;

  @Column
  @Field(() => Int, {nullable: true })
  other_report: number;

  @Column
  @Field(() => Int, {nullable: true })
  plan_duration: number;

  @Column
  @Field(() => String, {nullable: true })
  plan_duration_unit: string;

  @Column
  @Field(() => String, {nullable: true })
  other_config: string;

  @Column
  @Field(() => Int, {nullable: true })
  organization: number;

  @HasOne(() => MembershipFees)
  @Field(() => MembershipFees, {nullable: true })
  membershipFeesData: MembershipFees
}
