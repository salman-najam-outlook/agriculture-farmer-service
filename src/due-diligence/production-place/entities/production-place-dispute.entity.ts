import {BelongsTo, Column, CreatedAt, ForeignKey, HasMany, Model, Table, UpdatedAt} from "sequelize-typescript";
import {Field, ID, Int, ObjectType} from "@nestjs/graphql";
import {DueDiligenceProductionPlace} from "./production-place.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";
import {ProductionPlaceDisputeComments} from "./dispute-comment.entity";
import { Geofence } from "src/geofence/entities/geofence.entity";
import { DisputeStatus } from "../dto/production-place-dispute.input";
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';

@Table({tableName:"production_place_disputes"})
@ObjectType()
export class ProductionPlaceDisputes extends Model{
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: "id" })
    id: number;

    @ForeignKey(() => DueDiligenceProductionPlace)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "production place id" })
    productionPlaceId: number;

    @ForeignKey(()=>User)
    @Column({ allowNull: false })
    @Field(() => Int, { description: "production place id" })
    createdBy: number;

    @Column({ allowNull: false })
    @Field(() => String, { description: "title" })
    title: string;

    @Column({ allowNull: true })
    @Field(() => String, { description: "description" })
    description: string;

    @Column({ allowNull: true })
    @Field(() => String, { description: "s3Key" })
    s3Key: string;

    @Column({ allowNull: true })
    @Field(() => String, { description: "s3Location" })
    s3Location: string;

    @Column({ allowNull: false, field: "geofence_id" })
    @ForeignKey(() => Geofence)
    @Field(() => Int, { nullable: false })
    geofenceId: number;

    @Column({ allowNull: false, field: "status" })
    @Field(() => DisputeStatus, { nullable: false })
    status: DisputeStatus;

    @Column({ allowNull: true, field: "createdAt" })
    @Field(() => Date, { nullable: true })
    @CreatedAt
    public createdAt: Date;

    @Column({ allowNull: true, field: "updatedAt" })
    @Field(() => Date, { nullable: true })
    @UpdatedAt
    public updatedAt: Date;

    @BelongsTo(() => Geofence)
    @Field(() => Geofence)
    geofence: Geofence;

    @BelongsTo(() => DueDiligenceProductionPlace)
    @Field(() => DueDiligenceProductionPlace)
    production_place: DueDiligenceProductionPlace;

    @BelongsTo(() => User)
    @Field(() => User)
    creating_user: User;

    @HasMany(() => ProductionPlaceDisputeComments)
    @Field(() => [ProductionPlaceDisputeComments])
    comments: ProductionPlaceDisputeComments[];

    @Column({ allowNull: true })
    @Field(() => String, { nullable: true, description: "initialPlantationDate" })
    initialPlantationDate: string;

    @ForeignKey(() => DeforestationReportRequest)
    @Column({ references: { model: 'deforestation_report_requests', key: 'id' } })
    @Field(() => Int)
    deforestationReportRequestId: number;

    @BelongsTo(() => DeforestationReportRequest, 'deforestationReportRequestId')
    @Field(() => DeforestationReportRequest)
    DeforestationReportRequest: DeforestationReportRequest;
}
