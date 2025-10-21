import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'

@InputType()
export class CreateUserAddonsInput {

  @Field(() => [Int])
  addonIds: []

  @Field(() => Int)
  userMembershipId: number

  @Field({ nullable: true })
  startDate: Date

  @Field({ nullable: true })
  endDate: Date
}
