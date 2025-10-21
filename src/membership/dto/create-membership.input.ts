import { InputType, Int, Field, GraphQLISODateTime } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'

@InputType()
export class CreateMembershipInput {
  @Field(() => String)
  membership_name: string

  @Field(() => String)
  description: string

  @Field(() => Int)
  no_of_animals: number

  @Field(() => [Int])
  satellite_report: number

  @Field(() => [Int])
  pasture_report: number

  @Field(() => [Int])
  other_report: number

  @Field(() => [Int])
  plan_duration: number

  @Field(() => [String])
  plan_duration_unit: string
  
  @Field(() => [Int])
  plan_duration_in_days: number

  @Field(() => [String])
  other_config: string

  @Field(() => Int)
  organization: number
}
