import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { Directive, Field, Float, ID, Int, ObjectType } from '@nestjs/graphql';
import { FLOAT, ENUM, INTEGER, STRING, DATE, DOUBLE, TINYINT } from 'sequelize';
import { Geofence } from './geofence.entity';

@Table({tableName: 'geofence_coordinates'})
@Directive('@key(fields: "id")')
@ObjectType()
export class GeofenceCoordinates extends Model {

  @Column({autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column({ type: STRING})
  @Field(() => String, {nullable: true })
  lat: string;

  @Column({ type: STRING})
  @Field(() => String, {nullable: true })
  log: string;

  @Column
  @Field(() => Int)
  @ForeignKey(() => Geofence)
  geofenceId: number

  @BelongsTo(() => Geofence)
  @Field(() => Geofence, { nullable: true })
  geofenceData: Geofence


}
