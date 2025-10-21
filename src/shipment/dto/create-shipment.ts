import { InputType, Int, Field, Float, ObjectType } from '@nestjs/graphql';
import { CreateShipmentStopInput } from './create-shipment-stop'
import { CreateShipmentDuedeligenceReportInput } from './create-shipment-duedeligence-report'

@InputType()
export class CreateShipmentInput {
  @Field(() => String, { nullable: true })
  exporter?: string;

  @Field(() => String, { nullable: true })
  importer?: string;

  @Field(() => String, { nullable: true })
  shipment_refrence_number?: string;

  @Field(() => String, { nullable: true })
  ownership_type?: string;

  @Field(() => String, { nullable: true })
  buyer?: string;

  @Field(() => String, { nullable: true })
  part_of_origin?: string;

  @Field(() => String, { nullable: true })
  part_of_destination?: string;

  @Field(() => String, { nullable: true })
  shipping_line?: string;

  @Field(() => String, { nullable: true })
  expected_arrival_date?: string;

  @Field(() => String, { nullable: true })
  container_id: string;

  @Field(() => String, { nullable: true })
  container_type?: string;

  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => Float, { nullable: true })
  container_size?: number;

  @Field(() => Float, { nullable: true })
  container_capacity?: number;

  @Field(() => Int, { nullable: true })
  organization_id?:number

  @Field(() => [CreateShipmentStopInput], { nullable: true })
  shipment_stops?: [CreateShipmentStopInput];

  @Field(() => [CreateShipmentDuedeligenceReportInput], { nullable: true })
  due_deligence_report_ids?: [CreateShipmentDuedeligenceReportInput];

  
  
}
@InputType()
export class UpdateShipment {
  @Field(() => Number, { nullable: false })
  id: number;

  @Field(() => String, { nullable: false })
  status: string;
}