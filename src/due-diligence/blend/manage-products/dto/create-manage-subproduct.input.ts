import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateManageSubproductDto {
  @Field(() => ID)
  @IsNotEmpty()
  productId: number;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  hsCode?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  eudrDocumentCode?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  s3Key?: string;
}
