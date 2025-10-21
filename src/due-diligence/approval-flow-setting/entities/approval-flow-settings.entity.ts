import { Model, Table, Column, DataType, PrimaryKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';

export enum DocumentVisibility {
    PRIVATE = 'private',
    COOPERATIVE_AND_PTSI_ONLY = 'cooperative_and_ptsi_only',
    PUBLIC = 'public'
}

export enum TimeUnit {
    DAYS = 'days',
    WEEKS = 'weeks',
    MONTHS = 'months'
}

registerEnumType(DocumentVisibility, {
    name: 'DocumentVisibility',
    description: 'Document visibility options for DDS reports'
});

registerEnumType(TimeUnit, {
    name: 'TimeUnit',
    description: 'Time units for approval expiration period'
});

@ObjectType()
@Table({ tableName: 'approval_flow_settings' })
export class ApprovalFlowSetting extends Model {
    @Field(() => Int)
    @PrimaryKey
    @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
    id: number;

    @Field(() => Int)
    @Column({ allowNull: false, field: 'org_id' })
    org_id: number;

    @Field(() => Int, { nullable: true })
    @Column({ allowNull: true, field: 'approval_expiration_period' })
    approval_expiration_period: number;

    @Field(() => TimeUnit, { nullable: true })
    @Column({ 
        allowNull: true, 
        field: 'approval_expiration_unit',
        type: DataType.ENUM(...Object.values(TimeUnit))
    })
    approval_expiration_unit: TimeUnit;

    @Field(() => DocumentVisibility, { nullable: true })
    @Column({ 
        allowNull: true, 
        field: 'document_visibility',
        type: DataType.ENUM(...Object.values(DocumentVisibility)),
        defaultValue: DocumentVisibility.PRIVATE
    })
    document_visibility: DocumentVisibility;

    @Field(() => Boolean, { nullable: true })
    @Column({ 
        allowNull: true, 
        field: 'is_default',
        defaultValue: false
    })
    is_default: boolean;

    @Field(() => Date)
    @CreatedAt
    @Column({ field: 'created_at' })
    created_at: Date;

    @Field(() => Date)
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updated_at: Date;
}
