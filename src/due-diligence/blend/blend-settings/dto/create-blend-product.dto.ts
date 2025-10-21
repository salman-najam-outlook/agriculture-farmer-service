import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateBlendProductDto {
  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @Field(() => Number, { nullable: true})
  @IsOptional()
  @IsNumber()
  subProductId: number;

  @Field(() => String)
  @IsOptional()
  @IsString()
  originCountry: string;

  @Field(() => Number)
  @IsNotEmpty()
  @IsNumber()
  percentage: number;
}
