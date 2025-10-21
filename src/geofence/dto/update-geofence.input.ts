import { CreateGeofenceInput } from './create-geofence.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateGeofenceInput extends PartialType(CreateGeofenceInput) {
  @Field(() => Int)
  id: number;
}
