import { Field, ObjectType } from '@nestjs/graphql';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { DeforestationReportRequest } from './deforestation_report_request.entity';
@ObjectType()
@Table({ tableName: 'deforestation_satellite_reports' })
export class DeforestrationSateliteResponse extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @Column({ field: 'report_request_id' })
  @ForeignKey(() => DeforestationReportRequest)
  reportRequestId: number;

  @BelongsTo(() => DeforestationReportRequest)
  reportRequestDetails: DeforestationReportRequest;

  @Column({ allowNull: true, field: 'report_name' })
  @Field(() => String, { nullable: false })
  reportName: string;

  @Column({ allowNull: true, field: 'image_hash' })
  @Field(() => String, { nullable: true })
  imageHash: string;

  @Column({ allowNull: true, field: 'satelite_source' })
  @Field(() => String, { nullable: true })
  satelliteSource: string;

  @Column({ allowNull: true, field: 'image_name' })
  @Field(() => String, { nullable: true })
  imageName: string;

  @Column({ allowNull: true, field: 'image_path' })
  @Field(() => String, { nullable: true })
  imagePath: string;

  @Column({ allowNull: true, field: 'img_s3_key' })
  @Field(() => String, { nullable: true })
  imgS3Key: string;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  status: string;

  @Column({ allowNull: true })
  // @Field(() => Number, { nullable: true, defaultValue: 0 })
  ordering: number;

  @CreatedAt
  @Column({ allowNull: true, field: 'created_at' })
  @Field(() => String, { nullable: true })
  createdAt: string;

  @UpdatedAt
  @Column({ allowNull: true, field: 'updated_at' })
  @Field(() => String, { nullable: true })
  updatedAt: Date;

  @Column({ field: 'is_deleted', defaultValue: false })
  @Field(() => Boolean, { nullable: true })
  isDeleted: boolean;
}
