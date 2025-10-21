import {
  Table,
  Column,
  Model,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
  DeletedAt,
  DataType,
  HasOne,
} from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ManageProduct } from './manage-products.entity';
import { Organization } from 'src/users/entities/organization.entity';
import { User } from 'src/users/entities/user.entity';

export enum SubProductType {
  GLOBAL = 'global',
  INTERNAL = 'internal',
}
@Table({ tableName: 'manage_subproducts', paranoid: true })
@ObjectType()
export class ManageSubproduct extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: 'Subproduct ID' })
  id: number;

  @ForeignKey(() => ManageProduct)
  @Column({ allowNull: false })
  @Field(() => ID, { description: 'Product ID' })
  productId: number;

  @Column({ allowNull: false })
  @Field(() => String, { description: 'Subproduct Name' })
  name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'EUDR Document Code', nullable: true })
  eudrDocumentCode: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'S3 Key', nullable: true })
  s3Key: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'HS Code', nullable: true })
  hsCode: string;

  @ForeignKey(() => Organization)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, { nullable: false })
  orgId: number;

  @Column({ allowNull: true, type: DataType.ENUM("global","internal") })
  @Field(() => String, { description: 'Sub Product type', nullable: true })
  subProductType: SubProductType;

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  @Field(() => Int, { description: 'user id' })
  createdBy: number;

  @CreatedAt
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeletedAt
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @BelongsTo(() => ManageProduct)
  @Field(() => ManageProduct, {
    nullable: true,
    description: 'Related product',
  })
  product: ManageProduct;
}
