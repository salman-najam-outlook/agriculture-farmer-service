import { InputType, Int, Field, Float } from '@nestjs/graphql';

@InputType()
export class CoordinatesInput {
  @Field(() => String, { nullable: false })
  lat: string;
  @Field(() => String, { nullable: false })
  log: string;
  // @Field(() => Int, { nullable: true })
  // geoFenceId: number;
}

@InputType()
export class SegmentInput {
  @Field(() => [CoordinatesInput], { nullable: false })
  coordinates: CoordinatesInput[];

  @Field(() => String, { nullable: false })
  geofenceName: string;

  @Field(() => Float, { nullable: false })
  geofenceArea: number;

  @Field(() => Int, { nullable: false })
  geofenceAreaUOMId: number;

  @Field(() => Float, { nullable: false })
  geofenceParameter: number;

  @Field(() => Int, { nullable: false })
  geofenceParameterUOMId: number;
}

@InputType()
export class CreateSegmentInput {
  @Field(() => Int, { nullable: false })
  farmId: number;

  @Field(() => [SegmentInput], { nullable: false })
  segments: SegmentInput[];
}
