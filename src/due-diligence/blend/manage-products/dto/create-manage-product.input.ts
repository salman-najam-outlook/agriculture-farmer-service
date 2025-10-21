import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class CreateManageProductDto {
  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  name: string;

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
