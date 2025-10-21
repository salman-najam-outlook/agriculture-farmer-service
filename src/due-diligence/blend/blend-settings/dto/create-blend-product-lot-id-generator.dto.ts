import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsBoolean, IsNumber, IsOptional, IsEnum } from 'class-validator';

@InputType()
export class CreateBlendProductLotIdGeneratorDto {

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  typeFirst: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  typeSecond: string;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  separator: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  startCount?: string;
  
  @Field(() => String, { nullable: true, description: 'Static text for lot ID generation' })
  @IsOptional()
  @IsString()
  staticText?: string;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  reset: boolean;

  @Field(() => Number, { nullable: true, description: 'Year for lot ID generation' })
  @IsOptional()
  @IsNumber()
  year?: number;

  @Field(() => String, { nullable: true, description: 'Month for lot ID generation' })
  @IsOptional()
  @IsString()
  month?: string;

  @IsEnum(['None', 'Year', 'Month'])
  @IsOptional()
  resetFrequency?: 'None' | 'Year' | 'Month';
}
