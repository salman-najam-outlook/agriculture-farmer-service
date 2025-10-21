import { InputType, Int, Field, Float, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateShipmentDuedeligenceReportInput {
  
  @Field(() => Int, { nullable: false })
  due_deligence_report_id: number;
  
}