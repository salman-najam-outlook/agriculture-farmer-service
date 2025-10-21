import {Field, InputType, Int, ObjectType, registerEnumType} from "@nestjs/graphql";
import { CreateGeofenceCoordInput } from "src/geofence/dto/create-geofence-coordinates.input";
import { CreateGeofenceInput } from "src/geofence/dto/create-geofence.input";
import { ProductionPlaceDisputes } from "../entities/production-place-dispute.entity";

@InputType()
export class ProductionPlaceDisputeInput{
    @Field(() => Int)
    reportRequestId: number;

    @Field(() => String)
    title: string;

    @Field(() => String,{ nullable: true })
    description: string;

    @Field(() => String, { nullable: false })
    s3Key: string;

    @Field(() => String, { nullable: false })
    s3Location: string;

    @Field(() => CreateGeofenceInput, { nullable: false })
    geofence: CreateGeofenceInput;

    @Field(() => [CreateGeofenceCoordInput], { nullable: true })
    coordinates: [CreateGeofenceCoordInput];

    @Field(() => DisputeStatus, { nullable: false })
    status: DisputeStatus;

    @Field(() => String, { nullable: true })
    initialPlantationDate: string;
}

@InputType()
export class UpdateProductionPlaceDisputeInput{
    @Field(() => String)
    title: string;

    @Field(() => String,{ nullable: true })
    description: string;

    @Field(() => String, { nullable: true })
    s3Key: string;

    @Field(() => String, { nullable: true })
    s3Location: string;

    @Field(() => DisputeStatus, { nullable: false })
    status: DisputeStatus;

    @Field(() => String, { nullable: true })
    initialPlantationDate?: string;
}

@InputType()
export class DisputeCommentInput{
    @Field(() => Int)
    disputeId: number;

    @Field(() => String)
    comment: string;

    @Field(() => String, { nullable: true })
    s3Key: string;

    @Field(() => String, { nullable: true })
    s3Location: string;
}

@InputType()
export class ProductionPlaceDisputeFilterInput{
    @Field(() => Int,{ nullable: true })
    reportRequestId?: number;

    @Field(() => DisputeStatus, { nullable: true })
    disputeStatus?: DisputeStatus;

    @Field(() => Int, { nullable: true })
    page?: number;

    @Field(() => Int, { nullable: true })
    limit?: number;

    @Field(() => String, { nullable: true })
    searchPhrase: string;

    disputeIds: Array<number>
}

@ObjectType()
export class ProductionPlaceDisputePaginatedResponse {
    @Field(() => Int, { nullable: false })
    count: number;

    @Field(() => Int, { nullable: true })
    totalCount?: number;

    @Field(() => [ProductionPlaceDisputes], { nullable: true })
    rows: ProductionPlaceDisputes[];
}


export enum DisputeStatus {
    OPEN = "OPEN",
    CLOSED = "CLOSED",
    INFO_REQ = "INFO_REQ"
}

registerEnumType(DisputeStatus, {
    name: "DisputeStatus",
    description: "Displays the current state of a dispute"
});
