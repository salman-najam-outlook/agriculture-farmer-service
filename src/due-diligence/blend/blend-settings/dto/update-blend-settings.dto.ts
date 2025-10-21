import { Field, InputType, OmitType, PartialType } from '@nestjs/graphql';
import { CreateBlendSettingsDto } from './create-blend-settings.input';

@InputType()
class UpdateBlendSettingProductDto {
  @Field(() => Number, { nullable: true })
  productId?: number;

  @Field(() => Number, { nullable: true })
  subProductId?: number;

  @Field(() => String, { nullable: true })
  originCountry?: string;

  @Field(() => Number, { nullable: true })
  percentage?: number;
}

@InputType()
export class UpdateBlendSettingsDto extends PartialType(
  OmitType(CreateBlendSettingsDto, ['blendProducts'] as const),
) {
  @Field(() => String, { nullable: true })
  blendTitle?: string;

  @Field(() => String, { nullable: true })
  blendDescription?: string;

  @Field(() => String, { nullable: true })
  finalProductName?: string;

  @Field(() => String, { nullable: true })
  finalProductCode?: string;

  // Add an array of products specifically for updating associated products
  @Field(() => [UpdateBlendSettingProductDto], { nullable: true })
  blendProducts?: UpdateBlendSettingProductDto[];
}
