import { Field, Float, Int, ObjectType } from '@nestjs/graphql';
import { DOUBLE } from 'sequelize';
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
@Table({ tableName: 'report_request_coordinates' })
export class ReportRequestCoordinates extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ field: 'report_request_id' })
  @Field(() => Int)
  @ForeignKey(() => DeforestationReportRequest)
  reportRequestId: number;

  @BelongsTo(() => DeforestationReportRequest)
  @Field(() => DeforestationReportRequest, { nullable: true })
  reportRequestDetails: DeforestationReportRequest;

  @Column({ type: DOUBLE, allowNull: false })
  @Field(() => Float, { nullable: false })
  latitude: number;

  @Column({ type: DOUBLE, allowNull: false })
  @Field(() => Float, { nullable: false })
  longitude: number;

  @CreatedAt
  @Column({ allowNull: true, field: 'created_at' })
  @Field(() => Date, { nullable: true })
  createdAt: string;

  @UpdatedAt
  @Column({ allowNull: true, field: 'updated_at' })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
