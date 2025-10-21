import { CreateUserSettingInput } from './create-user-setting.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateUserSettingInput extends PartialType(CreateUserSettingInput) {
  @Field(() => Int)
  id: number;
}
