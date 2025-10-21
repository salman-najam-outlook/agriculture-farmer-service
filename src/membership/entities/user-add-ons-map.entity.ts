import { ObjectType, Field, Int, ID, GraphQLISODateTime } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import {
  Table,
  Column,
  Model,
  ForeignKey,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';
import { Addons } from './add-ons.entity';
import { UserMembership } from './userMembership.entity';

@Table({ tableName: 'users_add_ons' })
@ObjectType()
export class UserAddons extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { nullable: true })
  id: number
  
  @Column({ type: INTEGER })
  @ForeignKey(() => User)
  @Field(() => User)
  user_id: number;
  
  @Column({ type: INTEGER })
  @ForeignKey(() => Addons)
  @Field(() => Addons)
  add_on_id: number;

  @Column({ type: INTEGER })
  @ForeignKey(() => UserMembership)
  @Field(() => UserMembership)
  user_membership_id: number;

  @Column
  @Field(() => GraphQLISODateTime, { nullable: true })
  start_date: Date

  @Column
  @Field(() => GraphQLISODateTime, { nullable: true })
  end_date: Date
}
