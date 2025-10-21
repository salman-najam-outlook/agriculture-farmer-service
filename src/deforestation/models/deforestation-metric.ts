import { Field, Float, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DeforestationMetric {
  @Field(() => String)
  label: string;

  @Field(() => String)
  colorCode: string;

  @Field(() => String)
  colorName: string;

  @Field(() => Float)
  percent: number;

  @Field(() => Float)
  area: number;

  @Field(() => String)
  description: string;
}
