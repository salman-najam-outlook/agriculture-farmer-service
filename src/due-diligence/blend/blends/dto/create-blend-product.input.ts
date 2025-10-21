import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString, IsBoolean, IsInt, IsDate } from 'class-validator';

@InputType()
export class CreateBlendProductInput {


  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  productId?: number; // References the selected Product

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  subProductId?: number; // References the selected Sub-Product


  @Field(() => String, { description: 'product type', nullable: false })
  @IsString()
  productType:string

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  exemptProductId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  ddrId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  index?: number;
}
