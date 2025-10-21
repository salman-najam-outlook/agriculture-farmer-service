import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DataType,
  HasMany,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Directive, Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import {
  FLOAT,
  ENUM,
  INTEGER,
  STRING,
  DATE,
  DOUBLE,
  TINYINT,
  BOOLEAN,
} from "sequelize";
import { GeofenceCoordinates } from "./geofenceCoordinates.entity";
import { Farm } from "src/farms/entities/farm.entity";
import { FarmLocation } from "src/farms/entities/farmLocation.entity";

@Table({ tableName: "geofences" })
@Directive('@key(fields: "id")')
@ObjectType()
export class Geofence extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userId: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userDdsId: number;

  @Column
  @Field(() => Int)
  @ForeignKey(() => Farm)
  farmId: number;
  
  @Column
  @Field(() => Int)
  @ForeignKey(() => FarmLocation)
  farmLocationId: number;

  @BelongsTo(() => Farm)
  @Field(() => Farm, { nullable: true })
  farmData: Farm;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  geofenceName: string;

  @Column({ type: FLOAT })
  @Field(() => Float, { nullable: true })
  geofenceArea: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  geofenceAreaUOMId: number;

  @Column({ type: INTEGER })
  @Field(() => Float, { nullable: true })
  geofenceParameter: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  geofenceParameterUOMId: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  walkAndMeasure: number;

  @Column({ type: BOOLEAN })
  @Field(() => Boolean)
  is_deleted: boolean;

  @Column({ type: FLOAT })
  @Field(() => Float, { nullable: true })
  geofenceRadius: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  geofenceCenterLat: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  geofenceCenterLog: string;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  isPrimary: number;

  @Field(() => [GeofenceCoordinates], { nullable: true })
  @HasMany(() => GeofenceCoordinates, {
    onDelete: "CASCADE",
    hooks: true,
  })
  geofenceCoordinates: GeofenceCoordinates[];

  @Column({ type: STRING, allowNull: true })
  @Field(() => String, { nullable: true })
  generateMethod: string;

  @Column({ type: STRING, allowNull: true })
  @Field(() => String, { nullable: true })
  coordinateHash: string;
}
