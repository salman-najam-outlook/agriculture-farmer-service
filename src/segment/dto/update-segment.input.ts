import { InputType, Field, Int } from '@nestjs/graphql';
import { SegmentInput } from './create-segment.input';

@InputType()
export class UpdateSegmentInput extends SegmentInput {
  @Field(() => Int)
  id: number;

  @Field(() => Int, { nullable: false })
  farmId: number;
}
