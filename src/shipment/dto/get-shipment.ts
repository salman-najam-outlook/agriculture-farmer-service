import { InputType, Int, Field, Float, ObjectType } from '@nestjs/graphql';
import { ShipmentStop } from '../entities/shipment-stop.entity';
import {IsInt, IsOptional} from "class-validator";

@InputType()
export class GetShipmentInput {
    @Field(() =>Int , { nullable: false })
    id: string;

    @Field(() => String, { nullable: true })
    shipment_status: string;

    @Field(() => String, { nullable: true })
    eudr_search: string;

    @Field(() => String, { nullable: true })
    eudr_status: string;


}

@InputType()
export class ShipmentDiligenceReportsFilterInput {
    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    page?: number;

    @IsOptional()
    @IsInt()
    @Field(() => Int, { nullable: true })
    limit?: number;

    @Field(() => Int, { nullable: false })
    shipment_id?: number

    @Field(() => String, { nullable: true })
    country?: string

    @Field(() => String, { nullable: true })
    status?: string

    @Field(() => String, { nullable: true })
    searchPhrase?: string

    @Field(() => Int, { nullable: true })
    supplierId?: number

    @Field(() => String, { nullable: true })
    orderField?: string

    @Field(() => String, { nullable: true })
    order?: string


}
