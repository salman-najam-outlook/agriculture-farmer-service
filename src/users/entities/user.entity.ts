import { ObjectType, Field, Int, Directive, ID } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import {
  Table,
  Column,
  Model,
  PrimaryKey,
  DataType,
  CreatedAt,
  UpdatedAt, HasOne, ForeignKey, BelongsTo,
  HasMany,
} from 'sequelize-typescript';
import { Roles } from 'src/core/roles';
import {Organization} from "./organization.entity";
import { Farm } from 'src/farms/entities/farm.entity';

@Table({ tableName: 'users' })
@Directive('@key(fields: "id")')
@ObjectType()
export class User extends Model {
  @Column({ primaryKey: true, allowNull: false, autoIncrement: true })
  @Field(() => ID, { description: 'user id' })
  id: number;

  @Column({ type: INTEGER })
  @Field(()=>Int, { nullable: true})
  cf_userid: number;

  @Column
  @Field({ description: 'first name', nullable: true })
  firstName?: string;

  @Column
  @Field({ description: 'last name', nullable: true })
  lastName?: string;

  @Column
  @Field(() => Int, { description: 'country code', nullable: true })
  countryCode?: number;

  @Column
  @Field({ description: 'mobile', nullable: true })
  mobile?: string;

  @Column
  @Field({ description: 'email', nullable: true })
  email?: string;

  @Column
  @Field({ description: 'unverifiedMobile', nullable: true })
  unverifiedMobile?: string;

  @Column
  @Field({ description: 'unverifiedEmail', nullable: true })
  unverifiedEmail?: string;

  @Column
  @Field({ description: 'password', nullable: true })
  password?: string;

  @Column
  @Field({ description: 'language', nullable: true })
  language?: string;

  @Column
  @Field(() => String, { description: 'country id', nullable: true })
  countryId?: string;

  @Column
  @Field(() => String, { description: 'state id', nullable: true })
  stateId?: string;

  @Column
  @Field({ description: 'district', nullable: true })
  district?: string;

  @Column
  @Field({ description: 'village', nullable: true })
  village?: string;

  @Column
  @Field({ description: 'otp', nullable: true })
  otp?: string;

  @Column
  @Field({ description: 'businessName', nullable: true })
  businessName?: string;

  @Column
  @Field({ description: 'address', nullable: true })
  address?: string;

  @Column
  @Field({ description: 'fax', nullable: true })
  fax?: string;

  @Column
  @Field({ description: 'website', nullable: true })
  website?: string;

  @Column
  @Field({ description: 'localPremiseId', nullable: true })
  localPremiseId?: string;

  @Column
  @Field({ description: 'federalPremiseId', nullable: true })
  federalPremiseId?: string;

  @Column
  @Field({ description: 'userType', nullable: true })
  userType: string;

  @Column
  @Field({ description: 'registration_type', nullable: true })
  registration_type: string;

  @Column
  @Field(() => Int, { description: 'pushNotification', nullable: true })
  pushNotification?: number;

  @Column
  @Field(() => Int, { description: 'notificationSound', nullable: true })
  notificationSound?: number;

  @Column
  @Field(() => Int, { description: 'isLogin', nullable: true })
  isLogin: number;

  @Column
  @Field(() => Int, { description: 'verified', nullable: true })
  verified: number;

  @Column
  @Field(() => Int, { description: 'active', nullable: true })
  active: number;

  @Column
  @Field({ description: 'animal gender m/f', nullable: true })
  profilePicUrl?: string;

  @Column
  @Field({ description: 'animal gender m/f', nullable: true })
  profilePicS3Key?: string;

  @Column
  @Field({ description: 'animal gender m/f', nullable: true })
  profilePicName?: string;

  @Column
  @ForeignKey(()=>Organization)
  @Field(() => Int, { description: 'breed id', nullable: true })
  organization: number;

  @Column
  @Field({ description: 'cloginAttempts', nullable: true })
  loginAttempts: string;

  @Column
  @Field({ description: 'lockedToken', nullable: true })
  lockedToken: string;

  @Column({ defaultValue: Roles.FARMER })
  @Field({ description: 'role', nullable: true, defaultValue: Roles.FARMER })
  role: string;

  @Column
  @Field({ nullable: true })
  eori_number: string;

  @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @BelongsTo(() => Organization)
  org:Organization;
}
