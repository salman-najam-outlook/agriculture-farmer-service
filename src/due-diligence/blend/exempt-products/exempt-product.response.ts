import {
  Int,
  Field,
  ObjectType
} from '@nestjs/graphql';
import { ExemptProduct } from './entities/exempt-product.entity';

@ObjectType()
export class ExemptProductsPaginatedResponse {
    @Field(() => Int, { nullable: true })
    count: number;

    @Field(() => Int, { nullable: true })
    totalCount: number;

    @Field(() => [ExemptProduct], { nullable: true })
    rows: ExemptProduct[];
}