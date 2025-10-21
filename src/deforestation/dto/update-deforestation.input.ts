import { CreateDeforestationInput } from './create-deforestation.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateDeforestationInput extends PartialType(CreateDeforestationInput) {
  @Field(() => Int)
  id: number;
}
