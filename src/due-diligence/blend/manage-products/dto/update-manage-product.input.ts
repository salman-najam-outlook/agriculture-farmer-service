import { Field, InputType, ID } from '@nestjs/graphql';
import { IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdateManageProductDto {
  @Field(() => ID)
  id: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

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
