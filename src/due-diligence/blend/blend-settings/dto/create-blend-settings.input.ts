import { IsNotEmpty, IsString, IsOptional, ValidateNested } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { CreateBlendProductLotIdGeneratorDto } from './create-blend-product-lot-id-generator.dto';
import { CreateBlendProductDto } from './create-blend-product.dto';

@InputType()
export class CreateBlendSettingsDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  blendTitle: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  blendCode: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  blendDescription: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  finalProductName: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  finalProductCode: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  processType: string;

  @Field(() => CreateBlendProductLotIdGeneratorDto, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateBlendProductLotIdGeneratorDto)
  lotIdGenerator?: CreateBlendProductLotIdGeneratorDto;

  @Field(() => [CreateBlendProductDto], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBlendProductDto)
  blendProducts?: CreateBlendProductDto[];

  @Field(() => [CreateBlendProductDto], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateBlendProductDto)
  blendSubProducts?: CreateBlendProductDto[];
}
