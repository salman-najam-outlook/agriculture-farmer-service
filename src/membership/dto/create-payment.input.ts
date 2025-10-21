import { InputType, Int, Field, GraphQLISODateTime, Float } from '@nestjs/graphql'
import { IsOptional } from 'class-validator'

@InputType()
export class CreatePaymentInput {
  @Field(() => Int)
  paymentMethod: number

  @Field(() => String)
  transactionId: string

  @Field(() => String)
  status: string

  @Field(() => Float)
  amount: number

  @Field(() => String)
  currency: string

  @Field(() => String)
  paymentNote: string

  @Field(() => GraphQLISODateTime, { nullable: true })
  paymentDate: Date
  
  @Field(() => Boolean)
  isRefund: boolean

  @Field(() => String)
  payerInfo: string
}
