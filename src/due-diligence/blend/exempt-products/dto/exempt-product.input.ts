import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class ExemptProductDto {
  @Field(() => Int)
  @IsNotEmpty()
  supplierId: number;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  internalReferenceNumber: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  activity: string;

  @Field(() => [String], { nullable: true })
  @IsNotEmpty()
  countryOfActivity: string[];
 
  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  countryOfEntry: string;

  @Field(() => Int, { nullable: true })
  @IsNotEmpty()
  product: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  subProduct: number;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  productNetMass: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  productVolume: string;

  @Field(() => String, { nullable: true })
  @IsNotEmpty()
  @IsString()
  productDate: string;

  @Field(() => [String], { nullable: true })
  @IsNotEmpty()
  containerIds: string[];

}