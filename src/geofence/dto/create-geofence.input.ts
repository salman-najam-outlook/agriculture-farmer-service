import { InputType, Int, Field, Float } from '@nestjs/graphql';

@InputType()
export class CreateGeofenceInput {
  @Field(() => Int, {nullable: true })
  id: number;
  
  @Field(() => Int, {nullable: true })
  userId: number;
  
  @Field(() => Int, {nullable: true })
  farmId: number;
  
  @Field(() => String, {nullable: true })
  geofenceName: string;
  
  @Field(() => Float, {nullable: true })
  geofenceArea: number;
  
  @Field(() => Int, {nullable: true })
  geofenceAreaUOMId: number;
  
  @Field(() => Int, {nullable: true })
  geofenceParameter: number;
  
  @Field(() => Int, {nullable: true })
  geofenceParameterUOMId: number;
  
  @Field(() => Int, {nullable: true })
  walkAndMeasure: number;

  @Field(() => Int, {nullable: true })
  syncId: number;

  @Field(() => Float, {nullable: true })
  geofenceRadius: number;

  @Field(() => Float, {nullable: true })
  geofenceCenterLat: number;

  @Field(() => Float, {nullable: true })
  geofenceCenterLog: number;

  @Field(() => Int, {nullable: true })
  isPrimary: number;
  
  @Field(() => String, {nullable: true })
  createdAt: string;
  
  @Field(() => String, {nullable: true })
  updatedAt: string;
}
