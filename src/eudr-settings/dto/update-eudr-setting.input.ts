import { CreateEudrSettingInput } from './create-eudr-setting.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';

@InputType()
export class UpdateEudrSettingInput extends PartialType(CreateEudrSettingInput) {
  @Field(() => Int)
  id: number;
}
