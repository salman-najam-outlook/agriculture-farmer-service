import {BelongsTo, Column, CreatedAt, DataType, ForeignKey, Model, Table, UpdatedAt} from "sequelize-typescript";
import {Field, Int, ObjectType} from "@nestjs/graphql";
import {Farm} from "../../farms/entities/farm.entity";
import {Organization} from "../../users/entities/organization.entity";
import {ReportsType} from "./reports-type.entity";

@Table({ tableName: "reports_monthly_limits" })
@ObjectType()
export class MonthlyLimit extends Model {
    @Column({autoIncrement: true, primaryKey: true})
    @Field(() => Int)
    id: number;

    @ForeignKey(()=>Organization)
    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    organization_id: number;

    @ForeignKey(()=>ReportsType)
    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    report_type_id: number;

    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    limit: number;

    @Column({ allowNull: true, field: "createdAt" })
    @Field(() => Date, { nullable: true })
    @CreatedAt
    public createdAt: Date;

    @Column({ allowNull: true, field: "updatedAt" })
    @Field(() => Date, { nullable: true })
    @UpdatedAt
    public updatedAt: Date;

    @BelongsTo(() => Organization)
    @Field(() => Organization)
    organization: Organization;

    @BelongsTo(() => ReportsType)
    @Field(() => ReportsType)
    report_type: ReportsType;
}