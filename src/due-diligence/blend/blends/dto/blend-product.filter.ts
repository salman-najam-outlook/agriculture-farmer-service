import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt } from 'class-validator';

@InputType()
export class BlendProductFilter {
  @Field()
  @IsString()
  productId: string;

  @Field()
  @IsString()
  subProductId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  country?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  internalReferenceNumber?: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  containerId?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  hideBlendDdsProductIds?: string[];

  @Field(() => String, { nullable: true })
  @IsOptional()
  blendId?: string;
  
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  createdAt?: string;
  
}
