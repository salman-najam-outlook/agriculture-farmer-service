import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { DocumentVisibility, TimeUnit } from '../entities/approval-flow-settings.entity';

@InputType()
export class CreateApprovalFlowSettingInput {
    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(365)
    approval_expiration_period?: number;

    @Field(() => TimeUnit, { nullable: true })
    @IsOptional()
    @IsEnum(TimeUnit)
    approval_expiration_unit?: TimeUnit;

    @Field(() => DocumentVisibility, { nullable: true })
    @IsOptional()
    @IsEnum(DocumentVisibility)
    document_visibility?: DocumentVisibility;

    @Field(() => Boolean, { nullable: true })
    @IsOptional()
    is_default?: boolean;
}
