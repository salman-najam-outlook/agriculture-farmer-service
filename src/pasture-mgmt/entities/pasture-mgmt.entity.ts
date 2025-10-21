import { ObjectType, Field, Int, ID, Directive, Float } from '@nestjs/graphql';
import { DOUBLE } from 'sequelize';
import { Column, Table, Model, HasMany, CreatedAt, UpdatedAt } from 'sequelize-typescript';
import { PastureMgmtCoordinates } from './pasture-mgmt-coordinates.entity';

// pasture mgmt model is satellite report table
@Table({ tableName: 'satellite_reports' })
@ObjectType()
export class PastureMgmt extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => Int, { description: 'satellite report id' })
  id: number;

  @Column
  @Field(() => String, { nullable: false })
  locationName: string;

  @Column
  @Field(() => String, { nullable: false })
  reportType: string;

  @Column
  @Field(() => Date, { nullable: false })
  dateOfInterest: string;

  @Column
  @Field(() => Int, { nullable: true })
  zoomLevel: number;

  @Column
  @Field(() => Int, { nullable: false })
  userId: number;

  @Column
  @Field(() => Float, { nullable: true })
  centerLatitude: number;

  @Column
  @Field(() => Float, { nullable: true })
  centerLongitude: number;

  @Column
  @Field(() => String, { nullable: true })
  satelliteSource: string;

  @Column
  @Field(() => String, { nullable: true })
  inputImage: string;

  @Column
  @Field(() => String, { nullable: true })
  geoImagePath: string;

  @Column
  @Field(() => String, { nullable: true })
  shortImagePath: string;

  @Column
  @Field(() => String, { nullable: true })
  reportPDFPath: string;

  @Column
  @Field(() => String, { nullable: true })
  inputImgS3Key: string;

  @Column
  @Field(() => String, { nullable: true })
  reportS3Key: string;

  @Column
  @Field(() => String, { nullable: true })
  reportName: string;

  @Column
  @Field(() => String, { nullable: true })
  status: string;

  @Field(() => [PastureMgmtCoordinates], { nullable: true })
  @HasMany(() => PastureMgmtCoordinates, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  coordinates: PastureMgmtCoordinates[];

  @CreatedAt
  @Column
  @Field(() => Date, { nullable: true })
  createdAt: string;

  // @UpdatedAt
  // @Column
  // @Field(() => Date, {nullable: true })
  // updatedAt: string;

  // @CreatedAt public createdAt: Date;

  @UpdatedAt public updatedAt: Date;

  @Column
  @Field(() => Boolean)
  is_deleted: boolean
}
