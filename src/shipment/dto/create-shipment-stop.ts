import { InputType, Int, Field, Float, ObjectType } from '@nestjs/graphql';
import { ShipmentStop } from '../entities/shipment-stop.entity';

@InputType()
export class CreateShipmentStopInput {
  
  @Field(() => String, { nullable: true })
  title: string;

}