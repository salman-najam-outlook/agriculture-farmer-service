import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'

@InputType()
export class CreateUserMembershipInput {
  // @Field(() => Int)
  // userId: number

  @Field(() => Int)
  membershipId: number

  @Field(() => Int)
  paymentId: number

  @Field({ nullable: true })
  startDate: Date

  @Field({ nullable: true })
  endDate: Date
}
