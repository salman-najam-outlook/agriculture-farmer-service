import {Field, InputType, Int, ObjectType} from "@nestjs/graphql";
import {MonthlyLimit} from "../entities/report-limit.entity";

@InputType()
export class UsesLimitInput {
    @Field(() => Int)
    organizationId: number;
}

@ObjectType()
export class UsesLimitOutput extends MonthlyLimit{
    @Field(() => Int)
    used: number;
}