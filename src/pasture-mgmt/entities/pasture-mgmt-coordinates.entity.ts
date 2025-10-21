import { ObjectType, Field, Int, ID, Directive } from '@nestjs/graphql';
import { DOUBLE } from 'sequelize';
import { DATE } from 'sequelize';
import { STRING } from 'sequelize';
import { INTEGER } from 'sequelize';
import { BelongsTo, Column, ForeignKey, Table, Model } from 'sequelize-typescript';
import { PastureMgmt } from './pasture-mgmt.entity';

// pasture mgmt model is satellite report table
@Table({tableName: 'satellite_report_coordinates'})
@ObjectType()
export class PastureMgmtCoordinates extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'satellite report coordinates id' })
  id: number;

  @Column
  @Field(() => Int)
  @ForeignKey(() => PastureMgmt)
  satelliteReportId: number

  @BelongsTo(() => PastureMgmt)
  @Field(() => PastureMgmt, { nullable: true })
  pastureMgmtData: PastureMgmt

  @Column({ type: DOUBLE})
  @Field(() => Int, {nullable: false })
  latitude: number;

  @Column({ type: DOUBLE})
  @Field(() => Int, {nullable: false })
  longitude: number;
  
}
