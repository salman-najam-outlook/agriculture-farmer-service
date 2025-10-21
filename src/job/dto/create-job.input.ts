import { InputType, Int, Field } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class CreateJobInput {
  @Field(() => GraphQLJSON)
  payload: Record<string, any>;

  @Field(() => String, { nullable: true })
  modelType?: string;

  @Field(() => String, { nullable: true })
  modelId?: string;

  @Field(() => Int, { nullable: true })
  availableAttempts?: string;

  @Field(() => String, { nullable: true })
  availableAt?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  context?: Record<string, any>;

  @Field(() => Int, { nullable: true })
  priority?: number;

  @Field(() => String, { nullable: true })
  externalId?: string;
}

@InputType()
export class JobIdsInput {
  @Field(() => [Int], { nullable: 'itemsAndList' })
  jobIds?: number[];
}
