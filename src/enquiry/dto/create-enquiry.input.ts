import { InputType, Int, Field, ObjectType } from '@nestjs/graphql';
import { Enquiry } from '../entities/enquiry.entity';

@InputType()
export class CreateEnquiryInput {
  @Field(() => String, { nullable: false })
  subject: string;

  @Field(() => String, { nullable: false })
  areaOfEnquiry: string;

  @Field(() => String, { nullable: false })
  type: string;

  @Field(() => String, { nullable: false })
  imageLink: string;

  @Field(() => String, { nullable: false })
  description: string;
}

@ObjectType()
export class EnquiryPagination {
  @Field(() => Int, { nullable: true })
  count: number;

  @Field(() => Int, { nullable: true })
  totalCount: number;

  @Field(() => [Enquiry], { nullable: true })
  rows: [Enquiry];
}
