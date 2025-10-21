import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Column, Table, Model, ForeignKey, DataType } from 'sequelize-typescript';
import { DiligenceReport } from './diligence-report.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';

@Table({tableName: 'due_diligence_request_additional_information'})
@ObjectType()
export class RequestAdditionalInformation extends Model {
  @Column({ autoIncrement: true, primaryKey: true,  })
  @Field(() => ID , { nullable: true })
  id: number;

  @ForeignKey(()=>DiligenceReport)
  @Column
  @Field(() => String, {nullable: true })
  dueDiligenceReportId: string

  @ForeignKey(() => UserDDS)
  @Column
  @Field(() => String, {nullable: true })
  supplierId: string

  @Column
  @Field(() => String, {nullable: true })
  userId: string

  @Column
  @Field(() => String, {nullable: true })
  cfUserId: string

  @Column
  @Field(() => String, {nullable: true })
  description: string

  @Column
  @Field(() => String, {nullable: true })
  status: string

  @Column({ type: DataType.STRING, allowNull: true })
  @Field(() => String, { nullable: true })
  shareAccess: string

  @Column({ type: DataType.JSON, allowNull: true, defaultValue: [] })
  @Field(() => [String], { nullable: true })
  selectedStep: string[];  

  @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
  @Field(() => Boolean, { nullable: true })
  attachAllHighRiskFarms: boolean

  @Column({ type: DataType.BOOLEAN, allowNull: true, defaultValue: false })
  @Field(() => Boolean, { nullable: true })
  isPtsiApproval: boolean
}
