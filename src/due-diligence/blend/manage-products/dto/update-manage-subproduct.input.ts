import { Field, InputType, ID } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateManageSubproductDto {
  @Field(() => ID)
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  eudrDocumentCode?: string;
  
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  s3Key?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  hsCode?: string;
  
  @Field(() => ID)
  @IsNotEmpty()
  productId: number;
}
