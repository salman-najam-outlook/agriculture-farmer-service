import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
  DataType,
  HasMany,
} from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { BlendSettingProduct } from './blend-setting-product.entity';
import { BlendProductLotIdGenerator } from './blend-lot-id-configuration.entity';

@Table({ tableName: 'blend_settings', paranoid: true, timestamps: true })  // Enable soft deletes with `paranoid: true`
@ObjectType()
export class BlendSettings extends Model {
  @Field(() => ID, { description: 'Blend ID' })
  @Column({ primaryKey: true, autoIncrement: true ,type: DataType.INTEGER, field: 'id'})
  id: number;

  @Field(() => String, { description: 'Blend Title' })
  @Column({ allowNull: false, type: DataType.STRING, field: 'blend_title' })
  blendTitle: string;

  @Field(() => String, { description: 'Blend Code', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING, field: 'blend_code' })
  blendCode: string;

  @Field(() => String, { description: 'Blend Description', nullable: true })
  @Column({ allowNull: true, type: DataType.TEXT , field: 'blend_description'}) 
  blendDescription: string;

  @Field(() => String, { description: 'Final Product Name', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING,field: 'final_product_name' })
  finalProductName: string;

  @Field(() => String, { description: 'Final Product Code', nullable: true })
  @Column({ allowNull: true, type: DataType.STRING , field: 'final_product_code'})
  finalProductCode: string;

  @Field(() => String, { description: 'Process type', nullable: true })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'process_type',
  })
  processType: string;

  @Field(()=> Number, { nullable: false })
  @Column({ type: DataType.NUMBER, allowNull: false })
  orgId: number

  @Field(() => Date, { nullable: true, description: 'Creation Date' })
  @Column({ field: 'created_at' })
  @CreatedAt
  createdAt: Date;

  @Field(() => Date, { nullable: true, description: 'Last Update Date' })
  @Column({ field: 'updated_at' })
  @UpdatedAt
  updatedAt: Date;

  @Field(() => Date, { nullable: true, description: 'Deletion Date' })
  @Column({ field: 'deleted_at' })
  @DeletedAt
  deletedAt: Date;
  

  // Association with BlendSettingProduct
  @Field(() => [BlendSettingProduct], { description: 'List of associated products for the blend', nullable: true })
  @HasMany(() => BlendSettingProduct)
  blendSettingProducts: BlendSettingProduct[];

  // Association with BlendProductLotIdGenerator
  @Field(() => [BlendProductLotIdGenerator], { description: 'Lot ID configurations for the blend', nullable: true })
  @HasMany(() => BlendProductLotIdGenerator)
  blendLotIDConfigurations: BlendProductLotIdGenerator[];
}
