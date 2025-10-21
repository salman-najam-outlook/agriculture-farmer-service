import { ObjectType, Field, Int, Directive, ID } from '@nestjs/graphql';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt, HasMany,
} from 'sequelize-typescript';
import { Roles } from 'src/core/roles';
import {User} from "./user.entity";

@Table({ tableName: 'organization' })
@Directive('@key(fields: "id")')
@ObjectType()
export class Organization extends Model {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true })
  @Field(() => ID, { description: 'id' })
  id: number;

  @Column
  @Field({  nullable: true })
  name?: string;

  @Column
  @Field({  nullable: true })
  code?: string;

  @Column
  @Field({  nullable: true })
  isSubOrganization?: boolean;

  @Column
  @Field({  nullable: true })
  parent_id?: number;

  @Column({ allowNull: true })
  @Field({ nullable: true })
  cf_id?: number;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @HasMany(() => User)
  users: User[];
}
