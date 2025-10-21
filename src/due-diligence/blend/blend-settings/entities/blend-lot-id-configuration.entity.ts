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
} from 'sequelize-typescript';
import { Field, ObjectType } from '@nestjs/graphql';
import { BlendSettings } from './blend-settings.entity';

@Table({ tableName: 'blend_product_lot_id_generators', paranoid: true, timestamps: true })
@ObjectType()
export class BlendProductLotIdGenerator extends Model {
  @Field({ description: 'Lot ID Generator ID' })
  @Column({ primaryKey: true, type: DataType.INTEGER, autoIncrement: true, field: 'id' })
  id: number;

  @ForeignKey(() => BlendSettings)
  @Column({ allowNull: false, field: 'blend_setting_id' })
  blendSettingsId: number;

  @Field(() => String, { description: 'First Type', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'type_first' })
  typeFirst: string;

  @Field(() => String, { description: 'Second Type', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'type_second' })
  typeSecond: string;

  @Field(() => String, { description: 'Separator', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'separator' })
  separator: string;

  @Field(() => String, { description: 'Starting Count', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'start_count' })
  startCount: string;

  @Field(() => Boolean, { description: 'Reset Counter Each Year' })
  @Column({ allowNull: false, type: DataType.BOOLEAN, defaultValue: false, field: 'reset' })
  reset: boolean;

  @Field(() => String, { description: 'Lot ID', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'preview_lot_id' })
  lotId: string;

  @Field(() => Number, { description: 'Year for lot ID generation', nullable: true })
  @Column({ allowNull: true, type: DataType.INTEGER, field: 'year' })
  year: number;

  @Field(() => String, { description: 'Month for lot ID generation', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'month' })
  month: string;

  
  @Field(() => String, { description: 'Reset frequency for lot ID generation', nullable: true })
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  resetFrequency: 'None' | 'Year' | 'Month';

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

  @Field(() => String, { description: 'Static Text', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'static_text' })
  staticText: string;

  @BelongsTo(() => BlendSettings)
  blendSetting: BlendSettings;
}
