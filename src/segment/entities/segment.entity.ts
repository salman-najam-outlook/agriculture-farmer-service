import { ObjectType, Field, Int } from '@nestjs/graphql';

@ObjectType()
export class Segment {
  @Field(() => Boolean, { nullable: true })
  success: boolean;
}
