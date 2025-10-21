import { ObjectType, Int, Field } from '@nestjs/graphql';
import { PastureMgmt } from '../entities/pasture-mgmt.entity';

@ObjectType()
export class PasturePagination {
    @Field(() => Int, {nullable: true })
    count: number;

    @Field(() => Int, {nullable: true })
    totalCount: number;
    
    @Field(() => [PastureMgmt], {nullable: true })
    rows: [PastureMgmt];

}