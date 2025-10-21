import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import {
    Table,
    Column,
    Model,
    CreatedAt,
    UpdatedAt,
    ForeignKey,
    DataType,
    DeletedAt,
    BelongsTo,
} from 'sequelize-typescript';
import { BlendSettings } from './blend-settings.entity';
import { ManageProduct } from '../../manage-products/entities/manage-products.entity';
import { ManageSubproduct } from '../../manage-products/entities/manage-subproduct.entity';

@ObjectType()
@Table({
    tableName: 'blend_setting_products',
    timestamps: true,
    paranoid: true,
})
export class BlendSettingProduct extends Model {
    @Field(() => Int)
    @Column({
        primaryKey: true,
        autoIncrement: true,
        type: DataType.INTEGER,
        field: 'id'
    })
    id: number;

    @Field(() => Int)
    @ForeignKey(() => BlendSettings)
    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        field: 'blend_setting_id',
    })
    blendSettingsId: number;

    @Field(() => Int, { nullable: true })
    @ForeignKey(() => ManageProduct)
    @Column({
      allowNull: true,
      type: DataType.INTEGER,
      field: 'product_id',
    })
    productId?: number;
  
    @BelongsTo(() => ManageProduct, { foreignKey: 'productId' })
    @Field(() => ManageProduct, { nullable: true })
    product: ManageProduct;
  
    @Field(() => Int, { nullable: true })
    @ForeignKey(() => ManageSubproduct)
    @Column({
      allowNull: true,
      type: DataType.INTEGER,
      field: 'sub_product_id',
    })
    subProductId?: number;
  
    @BelongsTo(() => ManageSubproduct, {foreignKey: 'subProductId'})
    @Field(() => ManageSubproduct, { nullable: true })
    subProduct: ManageSubproduct;

    @Field({ nullable: true })
    @Column({
        allowNull: true,
        type: DataType.STRING,
        field: 'origin_country_id',
    })
    originCountry: string;

    @Field(() => Float, { nullable: true })
    @Column({
        type: DataType.FLOAT,
        allowNull: true,
        field: 'percentage',
    })
    percentage: number;

    @Field(() => Date, { nullable: true, description: 'Creation Date' })
    @CreatedAt
    @Column({ field: 'created_at' })
    createdAt: Date;

    @Field(() => Date, { nullable: true, description: 'Last Update Date' })
    @UpdatedAt
    @Column({ field: 'updated_at' })
    updatedAt: Date;

    @Field(() => Date, { nullable: true, description: 'Deletion Date' })
    @Column({ field: 'deleted_at' })
    @DeletedAt
    deletedAt: Date;

}
