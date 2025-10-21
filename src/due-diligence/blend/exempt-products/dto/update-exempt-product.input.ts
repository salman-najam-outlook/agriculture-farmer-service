import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { ExemptProductDto } from './exempt-product.input';

@InputType()
export class UpdateExemptProductDto extends PartialType(ExemptProductDto) {
  @Field(() => ID)
  id: number;
}