import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsInt, IsOptional } from "class-validator";
import { ManageSubproduct } from "../entities/manage-subproduct.entity";

@InputType()
export class ManageSubProductFilterInput {
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

  @Field(() => Int, {nullable: true})
  productId?: number

  @Field(() => String, {nullable: true})
  sortBy?: String

  @Field(() => String, {nullable: true})
  sortOrder?: String
}

@ObjectType()
export class ManageSubProductPaginatedResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [ManageSubproduct], { nullable: true })
  rows: ManageSubproduct[];
}