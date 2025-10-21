import {ObjectType, Field, Int} from "@nestjs/graphql";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    Model,
    Table,
} from "sequelize-typescript";
import {Assessment} from "./assessment.entity";
import { AssessmentResponse } from "./assessment-response.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { DiligenceReport } from "src/diligence-report/entities/diligence-report.entity";

@ObjectType()
@Table({tableName: "assessment_production_place", timestamps: true})
export class AssessmentProductionPlace extends Model {
    @Column({autoIncrement: true, primaryKey: true})
    @Field(() => Int)
    id: number;

    @Column({ allowNull: false, type: DataType.INTEGER })
    @ForeignKey(()=>Assessment)
    @Field(() => Int, { nullable: false })
    assessmentId: number;

    @Column({ allowNull: false, type: DataType.INTEGER })
    @ForeignKey(()=>DiligenceReport)
    @Field(() => Int, { nullable: false })
    diligenceReportId: number;

    @Column({ allowNull: true, type: DataType.INTEGER })
    @ForeignKey(()=>AssessmentResponse)
    @Field(() => Int, { nullable: true })
    assessmentResponseId: number;


    @Column({ allowNull: true, type: DataType.INTEGER })
    @ForeignKey(()=>DueDiligenceProductionPlace)
    @Field(() => Int, { nullable: true })
    productionPlaceId: number;

    @Column({ allowNull: true, type: DataType.STRING })
    @Field(()=> String, { nullable: true})
    riskAssessmentStatus: string;
    
    @Column({allowNull: true, field: "s3key"})
    @Field(() => String, {nullable: true})
    s3key: string;

    @Column({allowNull: true, field: "s3Location"})
    @Field(() => String, {nullable: true})
    s3Location: string;

    @Column({allowNull: true, field: "comment"})
    @Field(() => String, {nullable: true})
    comment: string;

    @Column({allowNull: true, field: "expiryDate"})
    @Field(() => Date, {nullable: true})
    expiryDate: Date;

    @Column({allowNull: false, field: "createdAt"})
    @Field(() => Date, {nullable: false})
    createdAt: Date;

    @Column({allowNull: false, field: "updatedAt"})
    @Field(() => Date, {nullable: false})
    updatedAt: Date;

    @Column({ allowNull: true })
    @Field(() => String, { nullable: true })
    taggableType: String;
    
    @Column({ allowNull: true })
    @Field(() => Int, { nullable: true })
    taggableId: number;
}
