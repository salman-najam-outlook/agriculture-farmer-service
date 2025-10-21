import { InputType, Int, Field, Float } from '@nestjs/graphql';
import { DOUBLE } from 'sequelize';
import { INTEGER } from 'sequelize';
import { Column } from 'sequelize-typescript';

@InputType()
export class CreateGeofenceCoordInput {
   
  @Field(() => Int, {nullable: true })
  geoFenceId: number;
  
  @Field(() => Float, {nullable: true })
  lat: number;
  
  @Field(() => Float, {nullable: true })
  log: number;
}


@InputType()
export class CreateGeofenceInputArr {
   
  @Field(() => [CreateGeofenceCoordInput], {nullable: true })
  geoFenceCoords: [CreateGeofenceCoordInput];

}
