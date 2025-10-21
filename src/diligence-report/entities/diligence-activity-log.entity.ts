import {Model, Column, Table, ForeignKey, DataType, CreatedAt, UpdatedAt, BelongsTo} from "sequelize-typescript";
import {Field, Int, ObjectType} from "@nestjs/graphql";
import {DiligenceReport} from "./diligence-report.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";

@Table({ tableName: "due_diligence_activity_logs" })
@ObjectType()
export class DiligenceActivityLog extends Model {
    @Column({autoIncrement: true, primaryKey: true})
    @Field(() => Int)
    id: number;

    @ForeignKey(()=>DiligenceReport)
    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    diligence_id: number;

    @ForeignKey(()=>User)
    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    user_id: number;

    @Column({ allowNull: false, type: DataType.STRING })
    @Field(() => String, { nullable: false })
    activity: string;

    @Column({ allowNull: false, type: DataType.STRING })
    @Field(() => String, { nullable: true })
    description: string;

    @Column({ allowNull: true, type: DataType.STRING(45), comment: 'IP address of the user who performed the action' })
    @Field(() => String, { nullable: true })
    ip_address: string;

    @Column({ allowNull: true, field: "createdAt" })
    @Field(() => Date, { nullable: true })
    @CreatedAt
    public createdAt: Date;

    @Column({ allowNull: true, field: "updatedAt" })
    @Field(() => Date, { nullable: true })
    @UpdatedAt
    public updatedAt: Date;

    @BelongsTo(() => DiligenceReport)
    @Field(() => DiligenceReport)
    diligenceReport: DiligenceReport;

    @BelongsTo(() =>User )
    @Field(() => User)
    user: User;
}