import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
  CreatedAt,
  UpdatedAt,
  DeletedAt,
} from 'sequelize-typescript';
import { Field, ObjectType, Int, Float } from '@nestjs/graphql';
import { Blend } from './blend.entity';
import { Product } from 'src/product/entities/product.entity';
import { SubProduct } from 'src/product/entities/sub-product.entity';
import { ExemptProduct } from '../../exempt-products/entities/exempt-product.entity';
import { ManageProduct } from '../../manage-products/entities/manage-products.entity';
import { ManageSubproduct } from '../../manage-products/entities/manage-subproduct.entity';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';

@ObjectType({ description: 'Blend Product Entity' })
@Table({
  tableName: 'blend_products',
  timestamps: true,
  paranoid: true,
  underscored: true,
})
export class BlendProduct extends Model {
  @Field(() => Int, { description: 'Unique identifier for the blend product' })
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Field(() => Int, { description: 'Associated Blend ID' })
  @ForeignKey(() => Blend)
  @Column({
    allowNull: false,
    type: DataType.INTEGER,
    field: 'blend_id',
  })
  blendId: number;

  @BelongsTo(() => Blend)
  blend: Blend;

  @Field(() => String, { description: 'product type', nullable: false })
  @Column({
    allowNull: true,
    type: DataType.STRING,
    field: 'product_type',
  })
  productType:string

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

  @Field(() => Int, { nullable: true })
  @ForeignKey(() => ExemptProduct)
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: 'exempt_product_id',
  })
  exemptProductId?: number;

  @Field(() => ExemptProduct, { nullable: true })
  @BelongsTo(() => ExemptProduct, {foreignKey: 'exemptProductId'})
  exemptProduct: ExemptProduct;


  @Field(() => Int, { nullable: true })
  @ForeignKey(() => DiligenceReport)
  @Column({
    allowNull: true,
    type: DataType.INTEGER,
    field: 'ddr_id',
  })
  ddrId?: number;

  @Field(() => DiligenceReport, { nullable: true })
  @BelongsTo(() => DiligenceReport, {foreignKey: 'ddrId'})
  ddr: DiligenceReport;

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

  @Field(() => Number, { nullable: true, description: 'Index Product' })
  @Column({ type: DataType.INTEGER, field: 'index' })
  index: number;
}
