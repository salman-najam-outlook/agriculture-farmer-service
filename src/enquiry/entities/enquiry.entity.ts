import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  BelongsTo,
  Column,
  CreatedAt,
  ForeignKey,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { User } from 'src/users/entities/user.entity';

@ObjectType()
@Table({ tableName: 'enquiries' })
export class Enquiry extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @Column({ allowNull: true, field: 'user_id' })
  @ForeignKey(() => User)
  @Field(() => String, { nullable: false })
  userId: string;

  @BelongsTo(() => User)
  user: User;

  @Column({ allowNull: true, field: 'subject' })
  @Field(() => String, { nullable: false })
  subject: string;

  @Column({ allowNull: true, field: 'area_of_enquiry' })
  @Field(() => String, { nullable: false })
  areaOfEnquiry: string;

  @Column({ allowNull: true, field: 'type' })
  @Field(() => String, { nullable: false })
  type: string;

  @Column({ allowNull: true, field: 'image_link' })
  @Field(() => String, { nullable: false })
  imageLink: string;

  @Column({ allowNull: true, field: 'description' })
  @Field(() => String, { nullable: false })
  description: string;

  @Column({ allowNull: true, field: 'status' })
  @Field(() => String, { nullable: false })
  status: string;

  @Column({ field: 'is_deleted', defaultValue: false })
  @Field(() => Boolean, { defaultValue: false })
  isDeleted: boolean;

  @CreatedAt
  createdAt: string;

  @UpdatedAt
  updatedAt: Date;
}
