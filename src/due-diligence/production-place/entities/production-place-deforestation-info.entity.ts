import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Column, Table, Model, DataType, BelongsTo, ForeignKey, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import {
  EudrDeforestationStatus,
  RiskAssessmentStatus,
} from 'src/due-diligence/production-place/entities/production-place.entity';
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';

@ObjectType()
@Table({ tableName: 'production_place_deforestation_info', timestamps: true })
export class ProductionPlaceDeforestationInfo extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => Int)
  id: number;

  @ForeignKey(() => DeforestationReportRequest)
  @Column({ references: { model: 'deforestation_report_requests', key: 'id' } })
  @Field(() => Int, { nullable: true })
  deforestationReportRequestId: number;

  @BelongsTo(() => DeforestationReportRequest, 'deforestationReportRequestId')
  @Field(() => DeforestationReportRequest, { nullable: true })
  deforestationReport: DeforestationReportRequest;

  @Column({ allowNull: true })
  @Field(() => String, { nullable: true })
  deforestationMitigationComment: string;

  @Column({
    type: DataType.ENUM(
      'Manually Mitigated',
      'Very High Deforestation Probability',
      'High Deforestation Probability',
      'Medium Deforestation Probability',
      'Low Deforestation Probability',
      'Very Low Deforestation Probability',
      'Zero/Negligible Deforestation Probability'
    ),
    allowNull: true,
  })
  @Field(() => String, { nullable: true })
  deforestationStatus: EudrDeforestationStatus;

  @Column({
    type: DataType.ENUM(
      'Very High Deforestation Probability',
      'High Deforestation Probability',
      'Medium Deforestation Probability',
      'Low Deforestation Probability',
      'Very Low Deforestation Probability',
      'Zero/Negligible Deforestation Probability'
    ),
    allowNull: true,
  })
  @Field(() => String, { nullable: true })
  originalDeforestationStatus: EudrDeforestationStatus;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @Field(() => Date, {
    nullable: true,
    description: 'EUDR deforestation status generated date',
  })
  deforestationStatusDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @Field(() => Date, {
    nullable: true,
    description: 'mitigation date',
  })
  lastDeforestationMitigationDate: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  @Field(() => Date, {
    nullable: true,
    description: 'dispute resolved date',
  })
  lastDisputeResolvedDate: Date;

  @Column({
    type: DataType.ENUM('approved', 'mitigation_required', 'rejected'),
    allowNull: true,
  })
  @Field(() => String, {
    nullable: true,
    description: 'EUDR deforestation status',
  })
  riskAssessmentStatus: RiskAssessmentStatus;

  @Column({
    type: DataType.ENUM(
      'Manually Mitigated',
      'Very High Deforestation Probability',
      'High Deforestation Probability',
      'Medium Deforestation Probability',
      'Low Deforestation Probability',
      'Very Low Deforestation Probability',
      'Zero/Negligible Deforestation Probability'
    ),
    allowNull: true,
  })
  @Field(() => String, { nullable: true })
  originalDeforestationStatusForTemporaryApproval: EudrDeforestationStatus;

  @CreatedAt
  @Field(() => String, { nullable: true })
  public createdAt: Date;

  @UpdatedAt
  @Field(() => String, { nullable: true })
  public updatedAt: Date;
}
