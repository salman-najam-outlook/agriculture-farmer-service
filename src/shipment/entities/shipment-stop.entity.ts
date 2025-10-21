import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import {Column, Table, Model, HasMany, UpdatedAt, CreatedAt, ForeignKey, BelongsTo} from 'sequelize-typescript';
import { STRING, DATE } from 'sequelize';
import { Shipment } from './shipment.entity'


@Table({tableName: 'shipment_stops'})
@ObjectType()
export class ShipmentStop extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'shipment_stop_id id' })
  id: number;

  @Column
  @Field(() => Int)
  @ForeignKey(() => Shipment)
  shipment_id: number
  

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  title: string


  @Column({ type: DATE})
  @Field(() => Date, {nullable: true })
  createdAt: Date;

  @UpdatedAt public updatedAt: Date;
}
