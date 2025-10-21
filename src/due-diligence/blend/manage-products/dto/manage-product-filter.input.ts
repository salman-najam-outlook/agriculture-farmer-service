import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { IsInt, IsOptional } from "class-validator";
import { ManageProduct } from "../entities/manage-products.entity";

@InputType()
export class ManageProductFilterInput {
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

  @Field(() => Boolean, {nullable: true})
  hasSubproducts?: boolean
}

@ObjectType()
export class ManageProductPaginatedResponse {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [ManageProduct], { nullable: true })
  rows: ManageProduct[];
}