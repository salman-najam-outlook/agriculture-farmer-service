import { CreateEnquiryInput } from './create-enquiry.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEnquiryInput extends PartialType(CreateEnquiryInput) {
  @Field(() => Int)
  id: number;
}
