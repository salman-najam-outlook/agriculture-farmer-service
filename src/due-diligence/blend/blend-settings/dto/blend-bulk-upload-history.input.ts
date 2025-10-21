import { InputType, Field, Int, ObjectType } from '@nestjs/graphql';
import { BlendBulkUploadHistory } from '../entities/blend-bulk-upload-history.entity';
import { IsInt, IsOptional } from 'class-validator';

@InputType()
export class BulkUploadHistoryInput {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @Field(() => String, {nullable: true})
  search?: String

  @Field(() => String, {nullable: true})
  sortBy?: String

  @Field(() => String, {nullable: true})
  sortOrder?: String
}

@ObjectType()
export class BulkUploadHistoryInputPaginatedResponse {
  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [BlendBulkUploadHistory], { nullable: true })
  rows: BlendBulkUploadHistory[];
}