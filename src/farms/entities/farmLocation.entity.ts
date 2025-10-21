import { Directive, Field, Float, ID, Int, ObjectType } from "@nestjs/graphql";
import { DOUBLE } from "sequelize";
import { INTEGER } from "sequelize";
import { DATE } from "sequelize";
import { TINYINT } from "sequelize";
import { FLOAT } from "sequelize";
import { STRING } from "sequelize";
import { Column, Model, Table, UpdatedAt } from "sequelize-typescript";
import { Geofence } from "src/geofence/entities/geofence.entity";
import { HasMany } from 'sequelize-typescript'

@Table({
  tableName: "user_farm_locations",
  timestamps: true,
})
@Directive('@key(fields: "id")')
@ObjectType()
export class FarmLocation extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID)
  id: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  address: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  area: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  recordId: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  city: string;

  @Column({ type: FLOAT })
  @Field(() => Int, { nullable: true })
  areaUomId: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  country: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  farmNumber: string;

  @Column({ type: DOUBLE })
  @Field(() => Float, { nullable: true })
  lat: string;

  @Column({ type: DOUBLE })
  @Field(() => Float, { nullable: true })
  log: string;

  @Column({ type: DOUBLE })
  @Field(() => Float, { nullable: true })
  parameter: number;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  state: string;

  @Column({ type: STRING })
  @Field(() => String, { nullable: true })
  street: string;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userId: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  userDdsId: number;

  @Column({ type: INTEGER })
  @Field(() => Int, { nullable: true })
  farmId: number;

  @Column({ type: TINYINT })
  @Field(() => Int, { nullable: true })
  isPrimary: number;

  @Column({ type: TINYINT })
  @Field(() => Int, { nullable: true })
  isDeleted: number;

  @Column({ type: DATE })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @Field(() => [Geofence], { nullable: true })
  @HasMany(() => Geofence, {
    onDelete: "CASCADE",
    hooks: true
  })
  geofences: Geofence[];
}
