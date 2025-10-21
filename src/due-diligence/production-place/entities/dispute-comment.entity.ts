import {BelongsTo, Column, CreatedAt, ForeignKey, Model, Table, UpdatedAt} from "sequelize-typescript";
import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {ProductionPlaceDisputes} from "./production-place-dispute.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";

@Table({tableName:"production_place_dispute_comments"})
@ObjectType()
export class ProductionPlaceDisputeComments extends Model{
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: "id" })
    id: number;

    @ForeignKey(()=>ProductionPlaceDisputes)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "Dispute ID" })
    disputeId: number;

    @ForeignKey(()=>User)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "Commented By" })
    commentedBy: number;

    @Column({ allowNull: true })
    @Field(() => String, { description: "comment" })
    comment: string;

    @Column({ allowNull: true })
    @Field(() => String, { description: "s3Key",nullable:true },)
    s3Key: string;

    @Column({ allowNull: true })
    @Field(() => String, { description: "s3Location",nullable:true })
    s3Location: string;

    @Column({ allowNull: true, field: "createdAt" })
    @Field(() => Date, { nullable: true })
    @CreatedAt
    public createdAt: Date;

    @Column({ allowNull: true, field: "updatedAt" })
    @Field(() => Date, { nullable: true })
    @UpdatedAt
    public updatedAt: Date;

    @BelongsTo(() => ProductionPlaceDisputes)
    @Field(() => ProductionPlaceDisputes)
    dispute: ProductionPlaceDisputes;

    @BelongsTo(() => User)
    @Field(() => User)
    commenting_user: User;
}