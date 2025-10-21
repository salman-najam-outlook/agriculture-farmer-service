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
import { Roles } from 'src/core/roles';

@Table({ tableName: 'role_module_permissions' })
@ObjectType()
export class RoleModulePermissions extends Model {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: false })
  @Field(() => String)
  id: number;

  @Column
  @Field({ nullable: false })
  role: string;

  @Column
  @Field({ nullable: false })
  module_id: string;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
