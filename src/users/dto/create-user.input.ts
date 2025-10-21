import { InputType, Int, Field, ID, ObjectType } from '@nestjs/graphql';
import { User } from '../entities/user.entity';
import { UserMembership } from 'src/membership/entities/userMembership.entity';
import { RoleModulePermissions } from '../entities/role_module_mapping.entity';
import { UserDDS } from '../entities/dds_user.entity';

@InputType()
export class CreateUserInput {
  @Field(() => ID, { description: 'user id', nullable: true })
  id: number;

  @Field(() => Int, { description: 'connected farmer user id', nullable: true })
  cf_userid?: number;

  @Field({ description: 'first name', nullable: true })
  firstName?: string;

  @Field({ description: 'last name', nullable: true })
  lastName?: string;

  @Field(() => Int, { description: 'country code', nullable: true })
  countryCode?: number;

  @Field({ description: 'mobile', nullable: true })
  mobile?: string;

  @Field({ description: 'email', nullable: true })
  email?: string;

  @Field({ description: 'unverifiedMobile', nullable: true })
  unverifiedMobile?: string;

  @Field({ description: 'unverifiedEmail', nullable: true })
  unverifiedEmail?: string;

  @Field({ description: 'password', nullable: true })
  password?: string;

  @Field({ description: 'language', nullable: true })
  language?: string;

  @Field({ description: 'country id', nullable: true })
  countryId?: string;

  @Field({ nullable: true })
  countryIsoCode?: string;

  @Field({ description: 'state id', nullable: true })
  stateId?: string;

  @Field({ description: 'district', nullable: true })
  district?: string;

  @Field({ description: 'village', nullable: true })
  village?: string;

  @Field({ description: 'otp', nullable: true })
  otp?: string;

  @Field({ description: 'businessName', nullable: true })
  businessName?: string;

  @Field({ description: 'address', nullable: true })
  address?: string;

  @Field({ description: 'fax', nullable: true })
  fax?: string;

  @Field({ description: 'website', nullable: true })
  website?: string;

  @Field({ description: 'localPremiseId', nullable: true })
  localPremiseId?: string;

  @Field({ description: 'federalPremiseId', nullable: true })
  federalPremiseId?: string;

  @Field({ description: 'userType', nullable: true })
  userType: string;

  @Field({ description: 'registration_type', nullable: true })
  registration_type: string;

  @Field(() => Int, { description: 'pushNotification', nullable: true })
  pushNotification?: number;

  @Field(() => Int, { description: 'notificationSound', nullable: true })
  notificationSound?: number;

  @Field(() => Int, { description: 'isLogin', nullable: true })
  isLogin: number;

  @Field(() => Int, { description: 'verified', nullable: true })
  verified: number;

  @Field(() => Int, { description: 'active', nullable: true })
  active: number;

  @Field({ description: 'animal gender m/f', nullable: true })
  profilePicUrl?: string;

  @Field({ description: 'animal gender m/f', nullable: true })
  profilePicS3Key?: string;

  @Field({ description: 'animal gender m/f', nullable: true })
  profilePicName?: string;

  @Field(() => Int, { description: 'breed id', nullable: true })
  organization: number;

  @Field({ description: 'cloginAttempts', nullable: true })
  loginAttempts: string;

  @Field({ description: 'lockedToken', nullable: true })
  lockedToken: string;

  @Field({ description: 'createdAt', nullable: true })
  createdAt: string;

  @Field({ description: 'companyId', nullable: true })
  companyId: string;

  @Field({ description: 'licenseNumber', nullable: true })
  licenseNumber: string;

  @Field({ description: 'source of user creation', nullable: true })
  source?: string;
}

@ObjectType()
export class CurrentUserOutput {
  @Field(() => User, { nullable: true })
  userDetail: User;
  @Field(() => UserMembership, { nullable: true })
  getUserCurrentMembershipPlan: UserMembership;
  @Field(() => [String], { nullable: true, description: ' modules' })
  modules: string[];
}

@ObjectType()
export class CurrentDDSUserOutput {
  @Field(() => UserDDS, { nullable: true })
  userDetail: UserDDS;
  @Field(() => UserMembership, { nullable: true })
  getUserCurrentMembershipPlan: UserMembership;
  @Field(() => [String], { nullable: true, description: ' modules' })
  modules: string[];
}