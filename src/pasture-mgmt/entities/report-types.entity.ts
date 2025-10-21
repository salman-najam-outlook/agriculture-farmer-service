import { ObjectType, Field, Int, ID, Directive } from '@nestjs/graphql';
import { DOUBLE } from 'sequelize';
import { DATE } from 'sequelize';
import { STRING } from 'sequelize';
import { INTEGER } from 'sequelize';
import { BelongsTo, Column, ForeignKey, Table, Model } from 'sequelize-typescript';
import { PastureMgmt } from './pasture-mgmt.entity';

// pasture mgmt model is satellite report table
@Table({tableName: 'report_types'})
@ObjectType()
export class ReportTypes extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'report types id' })
  id: number;

  @Column
  @Field(() => String, {nullable: false })
  name: string

  
}
