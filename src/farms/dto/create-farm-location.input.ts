import { Field, Float, InputType, Int } from "@nestjs/graphql";

@InputType()
export class CreateFarmLocationInput {
  @Field(() => String, { nullable: true })
  address?: string;

  @Field(() => String, { nullable: true })
  area?: string;

  @Field(() => String, { nullable: true })
  recordId?: string;

  @Field(() => String, { nullable: true })
  city?: string;

  @Field(() => Float, { nullable: true })
  areaUomId?: number;

  @Field(() => String, { nullable: true })
  country?: string;

  @Field(() => String, { nullable: true })
  farmNumber?: string;

  @Field(() => Float, { nullable: true })
  lat?: number;

  @Field(() => Float, { nullable: true })
  log?: number;

  @Field(() => Float, { nullable: true })
  parameter?: number;

  @Field(() => String, { nullable: true })
  state?: string;

  @Field(() => String, { nullable: true })
  street?: string;

  @Field(() => Int, { nullable: true })
  userId?: number;

  @Field(() => Int, { nullable: true })
  farmId?: number;

  @Field(() => Int, { nullable: true })
  isPrimary?: number;
}
