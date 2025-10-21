import { Table, Column, Model, CreatedAt, UpdatedAt, HasMany, DataType, DeletedAt, BelongsTo, ForeignKey } from 'sequelize-typescript';

import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import {Product} from "src/product/entities/product.entity";
import { ManageProduct } from '../../manage-products/entities/manage-products.entity';
import { ManageSubproduct } from '../../manage-products/entities/manage-subproduct.entity';
import { Organization } from 'src/users/entities/organization.entity';
import { ContainerDetail } from '../../container-details/entities/container-detail.entity';

@Table({ tableName: 'exempt_products', paranoid: true })  // paranoid: true enables soft delete
@ObjectType()
export class ExemptProduct extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: 'Exempt product ID' })
  id: number;

  @ForeignKey(() => User)
  @Column
  @Field(() => String, {nullable: true })
  supplierId: string

  @BelongsTo(() => User, { foreignKey:'supplierId', as:"supplier" })
  @Field(() => User, { nullable:true })
  supplier: User;

  @Column
  @Field(() => String, {nullable: true })
  internalReferenceNumber: string

  @Column
  @Field(() => String, {nullable: true })
  activity: string

  @Column({
    allowNull: true,
    type: DataType.JSON,
  })
  @Field(() => [String], {nullable: true })
  countryOfActivity: string[]

  @Column
  @Field(() => String, {nullable: true })
  countryOfEntry: string

  @ForeignKey(() => Product)
  @Column
  @Field(() => String, { nullable: true })
  product: string;

  @BelongsTo(() => ManageProduct, { foreignKey:'product', as:"productDetail" })
  @Field(() => ManageProduct, { nullable:true })
  productDetail: ManageProduct;

  @Column
  @Field(() => String, {nullable: true })
  subProduct: string

  @BelongsTo(() => ManageSubproduct, { foreignKey:'subProduct', as:"subProductDetail" })
  @Field(() => ManageSubproduct, { nullable:true })
  subProductDetail: ManageSubproduct;

  @Column
  @Field(() => String, {nullable: true })
  productNetMass: string

  @Column
  @Field(() => String, {nullable: true })
  productVolume: string

  @Column
  @Field(() => Date, { nullable: true })
  productDate: Date;

  @ForeignKey(()=>Organization)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, { nullable: false })
  orgId: number;

  @ForeignKey(()=>User)
  @Column({ allowNull: false })
  @Field(() => Int, { description: "user id" })
  createdBy: number;

  @CreatedAt
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @HasMany(() => ContainerDetail)
  @Field(() => [ContainerDetail], { nullable: true })
  containerIds: ContainerDetail[];

  @Column
  @Field(() => Boolean, { nullable: false, defaultValue: false })
  availability: boolean;

  @UpdatedAt
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeletedAt
  @Field(() => Date, { nullable: true })
  deletedAt: Date;  // Timestamp for soft delete
}
