// update-eudr-setting.input.ts
import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
class DeclarationStatementInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  country: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Boolean, { nullable: true })
  isEnabled: boolean;
}

@InputType()
export class UpdateEudrSettingInput {
  @Field(() => String, { nullable: true })
  radius_unit: string;

  @Field(() => Int, { nullable: true })
  radius_max_limit: number;

  @Field(() => [DeclarationStatementInput], { nullable: true })
  declarations: DeclarationStatementInput[];

  // Include any other fields you want to allow updates for in the EudrSetting
}