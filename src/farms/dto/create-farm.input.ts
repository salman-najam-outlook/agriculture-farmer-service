import { InputType, Int, Field, Float, ObjectType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { Farm } from '../entities/farm.entity';

@InputType()
class farmGeofence {
  @Field(() => String, { nullable: true })
  lat: number;

  @Field(() => String, { nullable: true })
  log: number;
}
@InputType()
export class CreateFarmInput {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: true })
  communityName: string;

  @Field(() => String, { nullable: true })
  address: string;

  @Field(() => String, { nullable: true })
  region: string;

  @Field(() => Int, { nullable: true })
  district: number;

  @Field(() => String, { nullable: true })
  zipCode: string;

  @Field(() => String, { nullable: true })
  farmName: string;

  @Field(() => String, { nullable: true })
  goal?: string;

  @Field(() => String, { nullable: true })
  farmTypeName: string;

  @Field(() => Int, { nullable: true })
  farmType?: number;

  @Field(() => [Int], { nullable: true })
  productionSystem?: [];

  @Field(() => String, { nullable: true })
  farmOwner?: string;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => String, { nullable: true })
  govRegistrationNum?: string;

  @Field(() => String, { nullable: true })
  contractMating?: string;

  @Field(() => String, { nullable: true })
  cooperativeId?: string;

  @Field(() => String, { nullable: true })
  cooperativeName?: string;

  @Field(() => String, { nullable: true })
  licenceNum?: string;

  @Field(() => String, { nullable: true })
  licenceExpiryDate?: string;

  @Field(() => String, { nullable: true })
  regulatorName?: string;

  @Field(() => String, { nullable: true })
  houseNum?: string;

  @Field(() => String, { nullable: true })
  street?: string;

  @Field(() => String, { nullable: true })
  farmNumber?: string;

  @Field(() => String, { nullable: true })
  regulatorRepresentiveName?: string;

  @Field(() => String, { nullable: true })
  registrationNo?: string;

  @Field(() => String, { nullable: true })
  ownerName: string;

  @Field(() => Float, { nullable: true })
  lat: number;

  @Field(() => Float, { nullable: true })
  log: number;

  @Field(() => Int, { nullable: true })
  farmingGoalOptId: number;

  @Field(() => Int, { nullable: true })
  parameter: number;

  @Field(() => String, { nullable: true })
  area: string;

  @Field(() => Float, { nullable: true })
  areaUomId?: number;

  @Field(() => Float, { nullable: true })
  parameterUomId?: number;

  @Field(() => Int, { nullable: true })
  isPrimaryFarm: number;

  @Field(() => Int, { nullable: true })
  isFarmRegistered?: number;

  @Field(() => Int, { nullable: true })
  isDeleted?: number;

  @Field(() => String, { nullable: true })
  farmOwnershipType?: string;

  @Field(() => [farmGeofence], { nullable: true })
  farmGeofence?: [farmGeofence];

  @Field(() => String, { nullable: true })
  farmingActivity?: string;

  @Field(() => Int, { nullable: true })
  syncId: number;

  @Field(() => String, { nullable: true })
  createdAt?: string;

  @Field(() => String, { nullable: true })
  updatedAt?: string;
}

@InputType()
export class SearchUserFarmInput {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  page?: number;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  limit?: number;

  @Field(() => String, { nullable: true, defaultValue: null })
  searchPhrase?: string;

  @Field(() => String, { nullable: true, defaultValue: 'id' })
  sortCol: string;

  @Field(() => String, { nullable: true, defaultValue: 'ASC' })
  sortOrder: string;
}

@ObjectType()
export class FarmListResponse {
  @Field(() => [Farm], { description: 'Example field (placeholder)' })
  rows: Farm[];

  @Field(() => Int, { description: 'Example field (placeholder)' })
  count: number;

  @Field(() => Int, { description: 'Example field (placeholder)' })
  fetchedRows: number;
}
