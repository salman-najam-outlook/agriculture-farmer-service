import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BlendSettingsPaginationDto {
  @Field(() => Int, { defaultValue: 10 })
  limit?: number;

  @Field(() => Int, { defaultValue: 1 })
  page?: number;

  @Field(() => String, { nullable: true })
  sortBy?: string;

  @Field(() => String, { defaultValue: 'DESC' })
  order: 'ASC' | 'DESC';
  
  @Field(() => String, { nullable: true })
  blendTitle?: string;
  
  @Field(() => String, { nullable: true })
  blendCode?: string;
}
