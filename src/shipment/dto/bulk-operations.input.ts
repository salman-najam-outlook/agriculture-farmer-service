import { InputType, Field, Int } from '@nestjs/graphql';
import { BulkOperationResponse } from '../../diligence-report/dto/create-diligence-report.input';

export { BulkOperationResponse };

@InputType()
export class BulkAssignShipmentsInput {
    @Field(() => [Int], { nullable: false })
    shipmentIds: number[];

    @Field(() => Int, { nullable: false })
    assignedTo: number;
}

@InputType()
export class BulkApproveShipmentsInput {
    @Field(() => [Int], { nullable: false })
    shipmentIds: number[];

    @Field(() => Boolean, { nullable: true, defaultValue: false })
    isTemporaryApproval?: boolean;

    @Field(() => Int, { nullable: true })
    approvalExpirationValue?: number;

    @Field(() => String, { nullable: true })
    approvalExpirationUnit?: string;
}

@InputType()
export class BulkRejectShipmentsInput {
    @Field(() => [Int], { nullable: false })
    shipmentIds: number[];

    @Field(() => String, { nullable: false })
    reason: string;
}