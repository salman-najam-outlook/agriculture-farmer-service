import {
  InputType,
  Int,
  Field,
} from '@nestjs/graphql';
import { IsInt, IsOptional } from 'class-validator';

@InputType()
export class ExemptProductsFilterInput {
    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    page?: number;

    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    limit?: number;

    @Field(() => String, { nullable: true })
    searchPhrase?: string

    @Field(() => String, { nullable: true })
    sortOrder?: string

    @Field(() => String, { nullable: true })
    sortColumn?: string
    
}