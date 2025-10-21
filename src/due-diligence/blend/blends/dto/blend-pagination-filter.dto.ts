import { Field, InputType, Int } from '@nestjs/graphql';

@InputType()
export class BlendListingPaginationDto {
  @Field(() => Int, { description: 'Page number', defaultValue: 1 })
  page: number;

  @Field(() => Int, { description: 'Number of records per page', defaultValue: 10 })
  limit: number;

  @Field(() => String, { description: 'Search keyword', nullable: true })
  search?: string;

  @Field(() => String, { description: 'Country filter', nullable: true })
  country?: string;

  @Field(() => String, { description: 'EUDR status filter', nullable: true })
  eudrStatus?: string;

  @Field(() => String, { description: 'Sort column', nullable: true, defaultValue: 'name' })
  sortBy?: string;

  @Field(() => String, { description: 'Sort order', nullable: true, defaultValue: 'ASC' })
  order?: 'ASC' | 'DESC';
}
