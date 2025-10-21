import { ObjectType, Field, Int, Float, ID } from '@nestjs/graphql';
import {Column, Table, Model, HasMany, UpdatedAt, BelongsToMany, BelongsTo} from 'sequelize-typescript';
import { STRING, DATE, ENUM } from 'sequelize';
import { ShipmentDueDeligenceReport } from './shipment-duedeligence-report.entity';
import {ShipmentStop} from "./shipment-stop.entity";
import {DiligenceReport} from "../../diligence-report/entities/diligence-report.entity";
import { UserDDS as User } from '../../users/entities/dds_user.entity';


@Table({tableName: 'shipments'})
@ObjectType()
export class Shipment extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'shipment id' })
  id: number;

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  exporter: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  importer: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  shipment_refrence_number: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  ownership_type: string

  @Column
  @Field(() => String, {nullable: true })
  buyer: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  part_of_origin: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  part_of_destination: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  shipping_line: string
  
  @Column
  @Field(() => Date, {nullable: true })
  expected_arrival_date: string


  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  container_id: string

  @Column({ type: STRING })
  @Field(() => String, {nullable: true })
  container_type: string

  @Column
  @Field(() => Float, {nullable: true })
  container_size: number

  @Column
  @Field(() => Float, {nullable: true })
  container_capacity: number

  @Column
  @Field(() => Int, {nullable:false})
  organization_id:number

  @Column
  @Field(() => Int, {nullable:true})
  subOrganizationId:number

  @Column({ type: DATE})
  @Field(() => Date, {nullable: true })
  createdAt: Date;

  @Field(() => [ShipmentDueDeligenceReport], { nullable: true })
  @HasMany(() => ShipmentDueDeligenceReport, {
    onDelete: 'CASCADE',
    hooks: true
  })
  shipmentReports: ShipmentDueDeligenceReport[];


  @Column({ type: ENUM('En Route', 'Delivered') })
  @Field(() => String, {nullable: true })
  status: string

  @Column({
    allowNull: true,
    type: STRING,
  })
  @Field(() => String, { nullable: true })
  statusLegends: string;

  @Column
  @Field(() => Boolean, {nullable: true })
  isTemporaryApproval: boolean;

  @Column
  @Field(() => Date, {nullable: true })
  temporaryExpirationDate: Date;

  @Column
  @Field(() => Int, {nullable: true })
  temporaryExpirationValue: number;

  @Column
  @Field(() => String, {nullable: true })
  temporaryExpirationUnit: string;

  @Column
  @Field(() => Int, {nullable: true })
  assignedTo: number;

  @Column
  @Field(() => Int, {nullable: true })
  assignedToCfId: number;

  @Column
  @Field(() => Date, {nullable: true })
  assignedDate: Date;

  @Column
  @Field(() => String, {nullable: true })
  rejectionReason: string;

  @BelongsTo(() => User, { foreignKey: 'assignedTo', targetKey: 'id', as: 'assignedToUser' })
  @Field(() => User, { nullable: true })
  assignedToUser: User;

  @HasMany(() => ShipmentStop)
  @Field(() => [ShipmentStop], { nullable: true })
  shipment_stops: ShipmentStop[];


  @BelongsToMany(() => DiligenceReport, () => ShipmentDueDeligenceReport)
  @Field(() => [DiligenceReport], { nullable: true })
  due_diligences: DiligenceReport[];


  @UpdatedAt public updatedAt: Date;

}
