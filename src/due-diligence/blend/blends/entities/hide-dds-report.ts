import { Table, Column, Model, CreatedAt, UpdatedAt, ForeignKey } from 'sequelize-typescript';

import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Blend } from './blend.entity';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';

@Table({ tableName: 'hide_dds_report_from_blend_products' })
@ObjectType()
export class HideDdsReport extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: 'Hide dds report ID' })
  id: number;

  @ForeignKey(() => Blend)
  @Column
  @Field(() => ID, {nullable: true })
  blendId: number

  @ForeignKey(() => DiligenceReport)
  @Column
  @Field(() => ID, {nullable: true })
  ddrId: number

  @CreatedAt
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date, { nullable: true })
  updatedAt: Date;
}
