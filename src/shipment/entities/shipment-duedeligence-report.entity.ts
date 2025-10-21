import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import { Column, Table, Model, HasMany,UpdatedAt,CreatedAt,ForeignKey, BelongsTo  } from 'sequelize-typescript';
import { STRING, DATE } from 'sequelize';
import { Shipment } from './shipment.entity'
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';


@Table({tableName: 'shipment_due_deligence_report'})
@ObjectType()
export class ShipmentDueDeligenceReport extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'shipment duedeligence report' })
  id: number;

  @Column
  @Field(() => Int)
  @ForeignKey(() => Shipment)
  shipment_id: number


  @Column
  @Field(() => Int)
  @ForeignKey(() => DiligenceReport)
  due_deligence_report_id: number

  @Field(() => DiligenceReport,{nullable:true})
  @BelongsTo(() => DiligenceReport)
  dueDeligenceReport: DiligenceReport
  
  @Field(() => Shipment,{nullable:true})
  @BelongsTo(() => Shipment, { foreignKey: 'shipment_id' })
  shipment: Shipment
  
  
  @Column({ type: DATE})
  @Field(() => Date, {nullable: true })
  createdAt: Date;

  @UpdatedAt public updatedAt: Date;

}
