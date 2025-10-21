import {ObjectType, Field, Int} from "@nestjs/graphql";
import {
    BelongsTo,
    Column,
    DataType,
    ForeignKey,
    HasMany,
    Model,
    Table,
} from "sequelize-typescript";
import {Assessment} from "./assessment.entity";
import { DiligenceReport } from "src/diligence-report/entities/diligence-report.entity";
import { DueDiligenceProductionPlace } from "src/due-diligence/production-place/entities/production-place.entity";
import { Farm } from 'src/farms/entities/farm.entity';
import { DiligenceReportAssessmentUpload } from 'src/diligence-report/entities/diligence-report-assessment-upload.entity';

@ObjectType()
@Table({tableName: "assessment_uploads", timestamps: true})
export class AssessmentUploads extends Model {
    @Column({autoIncrement: true, primaryKey: true})
    @Field(() => Int)
    id: number;

    @Column({ allowNull: false, type: DataType.INTEGER })
    @ForeignKey(()=>Assessment)
    @Field(() => Int, { nullable: false })
    assessment_id: number;


    @Column({ allowNull: false, type: DataType.INTEGER })
    @ForeignKey(()=>DiligenceReport)
    @Field(() => Int, { nullable: false })
    diligence_report_id: number;

    @Column({ allowNull: true, type: DataType.INTEGER })
    @ForeignKey(()=>DueDiligenceProductionPlace)
    @Field(() => Int, { nullable: true })
    production_place_id: number;

    @Column({allowNull: true, field: "s3Key"})
    @Field(() => String, {nullable: false})
    s3Key: string;

    @Column({allowNull: false, field: "s3Location"})
    @Field(() => String, {nullable: false})
    s3Location: string;

    @Column({allowNull: true, field: "comment"})
    @Field(() => String, {nullable: true})
    comment: string;

    @Column({allowNull: false, field: "expiry_date"})
    @Field(() => Date, {nullable: false})
    expiry_date: Date;

    @Column({allowNull: false, field: "createdAt"})
    @Field(() => Date, {nullable: false})
    createdAt: Date;

    @Column({allowNull: false, field: "updatedAt"})
    @Field(() => Date, {nullable: false})
    updatedAt: Date;

    @ForeignKey(() => Farm)
    @Column({ references: { model: 'user_farms', key: 'id' } })
    @Field(() => Int)
    farmId: number;

    @Column({ allowNull: true, type: DataType.STRING })
    @Field(()=> String, { nullable: true})
    riskAssessmentStatus: string;

    @HasMany(() => DiligenceReportAssessmentUpload)
    @Field(() => DiligenceReportAssessmentUpload, { defaultValue: [] })
    diligenceReportAssessmentUploads: DiligenceReportAssessmentUpload[];
}
