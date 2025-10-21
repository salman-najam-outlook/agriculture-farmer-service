import { InputType, Int, Field, ObjectType } from '@nestjs/graphql';

@InputType()
export class CreateUserSettingInput {
  @Field(() => String, { nullable: false })
  weightUnit: string;

  @Field(() => String, { nullable: false })
  language: string;
}

@ObjectType()
export class UserSettingOutPut {
  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: true })
  language: string;

  @Field(() => String, { nullable: true })
  weightUnit: string;
}
