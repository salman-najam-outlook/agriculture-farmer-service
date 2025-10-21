import { Field, ObjectType, Int } from '@nestjs/graphql';
import { BlendProductDto } from './blend-product.dto';

@ObjectType()
export class BlendProductsResponse {
  @Field(() => [BlendProductDto], { description: 'List of blend products' })
  rows: BlendProductDto[];

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => Int, { nullable: true })
  count: number;
}
