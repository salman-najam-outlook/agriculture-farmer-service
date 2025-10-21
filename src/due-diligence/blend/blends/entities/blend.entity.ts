import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import {
    Table,
    Column,
    Model,
    ForeignKey,
    CreatedAt,
    UpdatedAt,
    DataType,
    BelongsTo,
    DeletedAt,
    HasMany,
    BelongsToMany,
  } from 'sequelize-typescript';

import { BlendProduct } from './blend-product.entity';
import { BlendSettings } from '../../blend-settings/entities/blend-settings.entity';
import { IsBoolean, IsOptional } from 'class-validator';
import { ContainerDetail } from '../../container-details/entities/container-detail.entity';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';


@Table({ 
    tableName: 'dds_blends',
    timestamps: true,
    paranoid: true,
    underscored: true, 
})
@ObjectType({ description: 'Blend Entity' })
export class Blend extends Model{
    @Field(() => Int, { description: 'Unique identifier for the blend' })
    @Column({
      type: DataType.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    })
    id: number;

    @Field(() => String, { description: 'Name of the blend' })
    @Column({
      allowNull: false,
      type: DataType.STRING,
      field: 'name',
    })
    name: string;

    @Field(() => String, { description: 'code of the blend' })
    @Column({
      allowNull: false,
      type: DataType.STRING,
      field: 'blend_code',
    })
    blendCode?:string


    @Field(() => String, { description: 'Description of the blend', nullable: true })
    @Column({
      allowNull: true,
      type: DataType.TEXT,
      field: 'description',
    })
    description?: string;

    @Field(() => Float, { description: 'Net mass in kilograms', nullable: true })
    @Column({
      allowNull: true,
      type: DataType.DECIMAL(10, 2),
      field: 'net_mass',
    })
    netMass?: number;

  @Field(() => Float, { description: 'Volume in cubic meters', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.DECIMAL(10, 2),
    field: 'volume',
  })
  volume?: number;

  @Field(() => String, { description: 'Blend Lot ID', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'blend_lot_id',
  })
  blendLotId?: string;


  @Field(() => String, { description: 'Finished Product Lot ID', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'finished_product_lot_id',
  })
  finishedProductLotId?: string;

  @Field(() => [BlendProduct], { description: 'List of blend products', nullable: true })
  @HasMany(() => BlendProduct)
  blendProducts: BlendProduct[];

  @ForeignKey(() => BlendSettings)
  @Column({ field: 'blend_setting_id' })
  @Field(() => Int, {nullable: true })
  blendSettingId: number

  @BelongsTo(() => BlendSettings, { foreignKey:'blend_setting_id', as:"blendSetting" })
  @Field(() => BlendSettings, { nullable:true })
  blendSetting: BlendSettings;

  @Field(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @Column({
    type: DataType.BOOLEAN,
    field: 'continue_later',
  })
  continueLater: boolean;

  @Field(() => String, { description: 'Internal reference number', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'internal_reference_number',
  })
  internalReferenceNumber:string

  @Field(() => Int, { description: 'organization id', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: 'orgId',
  })
  companyId:number

  @Field(() => [String], { description: 'Country of entry', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.JSON,
    field: 'country_of_entry',
  })
  countryOfEntry:string[]

  @Field(() => String, { description: 'Activity type', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.ENUM('Domestic', 'Import', 'Export'),
    field: 'activity',
  })
  activity?: 'Domestic' | 'Import' | 'Export';

  @Field(() => String, { description: 'Country of activity', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'country_of_activity',
  })
  countryOfActivity:string

  @Field(() => String, { description: 'EUDR reference number', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'eudr_reference_number',
  })
  eudrReferenceNumber?: string;

  @Field(() => String, { nullable: true })
  @Column({
    allowNull: true,
    type: DataType.ENUM('pending', 'compliant', 'non-compliant', 'uploaded-to-eu-portal'),
    field: 'blend_status',
    defaultValue: 'pending' 
  })
  blendStatus: string;


  @HasMany(() => ContainerDetail)
  @Field(() => [ContainerDetail], { nullable: true })
  containerIds: ContainerDetail[];

  @Field(() => Date, { description: 'Creation Date' })
  @CreatedAt
  @Column({ field: 'created_at' })
  createdAt: Date;

  @Field(() => Date, { description: 'Last Update Date' })
  @UpdatedAt
  @Column({ field: 'updated_at' })
  updatedAt: Date;

  @Field(() => Date, { nullable: true, description: 'Deletion Date' })
  @DeletedAt
  @Column({ field: 'deleted_at' })
  deletedAt: Date;

   @BelongsToMany(() => DueDiligenceProductionPlace, {
    through: 'BlendDueDiligenceProductionPlace',
    foreignKey: 'blendId',
    otherKey: 'productionPlaceId',
  })
  @Field(() => [DueDiligenceProductionPlace], { nullable: true })
  dueDiligenceProductionPlaces: DueDiligenceProductionPlace[];

    
  @Field(() => Int, { nullable: true })
  @Column({ allowNull: true, type: DataType.INTEGER, field: "user_id", })
  userId: number;

  @BelongsTo(() => UserDDS, { foreignKey:'user_id', as:"userData" })
  @Field(() => UserDDS, { nullable:true })
  userData: UserDDS;
}
