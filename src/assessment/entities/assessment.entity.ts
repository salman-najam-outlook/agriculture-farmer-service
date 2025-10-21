import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Table, Model, HasMany } from 'sequelize-typescript';
import { DiligenceReportAssessment } from 'src/diligence-report/entities/diligence-report-assessment.entity';

// pasture mgmt model is satellite report table
@Table({tableName: 'assessments'})
@ObjectType()
export class Assesment extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column
  @Field(() => String, {nullable: true })
  title: string

  @Column
  @Field(() => String, {nullable: true })
  description: string

  @Column
  @Field(() => String, {nullable: true })
  status: string

  @HasMany(() => DiligenceReportAssessment)
  @Field(() => [DiligenceReportAssessment], { nullable: true })
  diligenceReportAssessments: DiligenceReportAssessment[];
}
