import { ObjectType, Field, Int, Float, InputType } from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';
import { UserDDS } from 'src/users/entities/dds_user.entity';

@ObjectType()
export class ProductDetails {
  @Field(() => String, { nullable: true, description: 'Product type (ExemptProduct or DiligenceReport)' })
  productType: string;

  @Field(() => String, { nullable: true, description: 'Internal reference number' })
  referenceNumber: string;

  @Field(() => String, { nullable: true, description: 'EUDR reference number (for DDR)' })
  EUDRReferenceNumber?: string;

  @Field(() => Float, { nullable: true, description: 'Net mass of the product' })
  netMass: number;

  @Field(() => Float, { nullable: true, description: 'Volume of the product' })
  volume: number;

  @Field(() => Int, { nullable: true, description: 'Farm count' })
  farmCount: number;
}

@ObjectType()
export class BlendDetails {
  @Field(() => Int, { description: 'Blend ID' })
  id: number;

  @Field(() => String, { description: 'Name of the blend' })
  name: string;

  @Field(() => String, { description: 'Blend lot ID' })
  blendLotId: string;
  
  @Field(() => Float, { nullable: true, description: 'Total net mass of the blend' })
  totalNetMass: number;
  
  @Field(() => Float, { nullable: true, description: 'Total volume of the blend' })
  totalVolume: number;

  @Field(() => Int, { nullable: true, description: 'Total farm count' })
  totalFarmCount: number;
  
  @Field(() => Int, { nullable: true, description: 'Total number of ingredients in the blend' })
  numberOfIngredients: number;
  
  @Field(() => String, { nullable: true, description: 'internalReferenceNumber' })
  internalReferenceNumber: string;

  @Field(() => [String], { nullable: true, description: 'Countries of entry for the blend' })
  countryOfEntry: string[];

  @Field(() => String, { nullable: true, description: 'EUDR reference number' })
  eudrReferenceNumber?: string;


  @Field(() => UserDDS, { description: 'User ID' })
  userId?: UserDDS;

  @Field(() => [ProductDetails], { description: 'List of associated products' })
  products?: ProductDetails[];

  @Field(() => String, { nullable: true, description: 'Blend status' })
  blendStatus: string;
}

@ObjectType()
export class FindAllBlendsResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [BlendDetails], { description: 'List of blend details' })
  rows: BlendDetails[];
}


@InputType()
export class BlendListFilterInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => String, {nullable: true})
  search?: String

  @Field(() => String, { nullable: true })
  blendStatus?: String


  @Field(() => [String], { nullable: true })
  searchByCountry?: string[];

  @Field(() => String, {nullable: true})
  sortBy?: String

  @Field(() => String, {nullable: true})
  sortOrder?: String
}
