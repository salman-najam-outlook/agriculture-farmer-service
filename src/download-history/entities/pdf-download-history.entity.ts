import { Field, Int, ObjectType, registerEnumType } from "@nestjs/graphql";
import { Model, Column, Table, ForeignKey, DataType, CreatedAt, UpdatedAt, BelongsTo, DeletedAt } from "sequelize-typescript";
import { DiligenceReport } from "src/diligence-report/entities/diligence-report.entity";
import { UserDDS as User } from "src/users/entities/dds_user.entity";

export enum PdfDownloadStatus {
    PENDING = "pending",
    INPROGRESS = "inprogress",
    FAILED = "failed",
    COMPLETED = "completed",
}

registerEnumType(PdfDownloadStatus, { name: "PdfDownloadStatus" });

@ObjectType()
@Table({ tableName: "pdf_download_histories", paranoid: true })
export class PdfDownloadHistory extends Model {
    @Column({ autoIncrement: true, primaryKey: true })
    @Field(() => Int)
    id: number;

    @ForeignKey(() => DiligenceReport)
    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    dueDiligenceReportId: number;

    @Column({ allowNull: true, type: DataType.STRING })
    @Field(() => String, { nullable: true })
    pdfType: string;

    @ForeignKey(() => User)
    @Column({ allowNull: true, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    userId: number;

    @Column({ allowNull: false, type: DataType.INTEGER })
    @Field(() => Int, { nullable: false })
    orgId: number;

    @Column({ allowNull: true, type: DataType.STRING })
    @Field(() => String, { nullable: true })
    estimatedTime: string;

    @Column({ allowNull: true, type: DataType.STRING })
    @Field(() => String, { nullable: true })
    fileName: string;

    @Column({ allowNull: true, type: DataType.STRING })
    @Field(() => String, { nullable: true })
    fileUrl: string;

    @Column({ allowNull: false, type: DataType.ENUM('inprogress', 'failed', 'completed') })
    @Field(() => PdfDownloadStatus)
    status: PdfDownloadStatus;

    @Column({ allowNull: true, type: DataType.TEXT('medium') })
    @Field(() => String, { nullable: false })
    errorMessage: string;

    @Column({ allowNull: true, type: DataType.DATE })
    @DeletedAt
    deletedAt: Date;

    @Column({ allowNull: true, type: DataType.DATE })
    @Field(() => Date, { nullable: true })
    completedAt: Date;

    @Column({ allowNull: true, field: "createdAt" })
    @Field(()=> Date)
    @CreatedAt
    public createdAt: Date;

    @Column({ allowNull: true, field: "updatedAt" })
    @UpdatedAt
    public updatedAt: Date;

    @BelongsTo(() => DiligenceReport)
    diligenceReport: DiligenceReport;

    @BelongsTo(() => User)
    user: User;
}

