import { Directive, Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import { Table, Column, Model } from 'sequelize-typescript';

@Table({ tableName: 'user_settings', timestamps: true })
@ObjectType()
export class UserSetting extends Model {
  @Column({ primaryKey: true, type: INTEGER })
  @Field(() => ID, { nullable: true })
  id: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userId: number;

  @Column
  @Field(() => String, { nullable: true })
  language: string;

  @Column
  @Field(() => String, { nullable: true })
  weightUnit: string;
}
