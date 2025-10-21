import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Table, Model, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import { DiligenceReport } from './diligence-report.entity';

@Table({ tableName: 'diligence_reports_transactions', timestamps: true })
@ObjectType()
export class DiligenceReportTransaction extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @ForeignKey(() => DiligenceReport)
  @Column
  @Field(() => Int)
  diligenceReportId: number;

  @BelongsTo(() => DiligenceReport, { foreignKey: 'diligenceReportId', as: 'diligenceReport' })
  @Field(() => DiligenceReport)
  diligenceReport: User;

  @Column
  @Field(() => String)
  transactionHash: string;

  @Column
  @Field(() => String)
  keccakHash: string;

  @Column
  @Field(() => String)
  s3Key: string;
}
