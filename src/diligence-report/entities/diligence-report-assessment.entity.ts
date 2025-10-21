import { ObjectType, Field, Int, ID, InputType, Directive } from '@nestjs/graphql';
import { Column, Table, Model, HasMany, DataType, BelongsTo, ForeignKey, HasOne, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { Assesment } from 'src/assessment/entities/assessment.entity';
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import { DiligenceReport } from './diligence-report.entity';
import {Product} from "../../product/entities/product.entity";
// pasture mgmt model is satellite report table


@Table({tableName: 'report_assessment', timestamps:true})
@ObjectType()
export class DiligenceReportAssessment extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'deligence id' })
  id: number;

  @ForeignKey(()=>User)
  @Column
  @Field(() => String, {nullable: true })
  user_id: string

  @ForeignKey(()=>DiligenceReport)
  @Column
  @Field(() => String, {nullable: true })
  diligence_id: string

  @BelongsTo(() => DiligenceReport)
  @Field(() => DiligenceReport, { nullable: true })
  diligence_report: DiligenceReport

  @ForeignKey(()=>Assesment)
  @Column
  @Field(() => ID, {nullable: true })
  assessment_id: number
    
  @Column
  @Field(() => String, {nullable: true })
  existing_survey: string

  @Column
  @Field(() => String, {nullable: true })
  placement: string

  @BelongsTo(() => Assesment)
  @Field(() => Assesment, { nullable: true })
  assessment: Assesment;

  @CreatedAt
  @Field(() => String, {nullable: true })
  public createdAt: Date;

  @UpdatedAt
  @Field(() => String, {nullable: true })
  public updatedAt: Date;

}
