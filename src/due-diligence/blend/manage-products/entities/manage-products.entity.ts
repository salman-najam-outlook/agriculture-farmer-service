import { Table, Column, Model, CreatedAt, UpdatedAt, HasMany, DataType, DeletedAt, HasOne, ForeignKey } from 'sequelize-typescript';
import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { ManageSubproduct } from './manage-subproduct.entity';
import { Organization } from 'src/users/entities/organization.entity';
import { User } from 'src/users/entities/user.entity';


export enum ProductType {
  GLOBAL = 'global',
  INTERNAL = 'internal',
}


@Table({ tableName: 'manage_products', paranoid: true })  // paranoid: true enables soft delete
@ObjectType()

export class ManageProduct extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: 'Product ID' })
  id: number;

  @Column({ allowNull: false })
  @Field(() => String, { description: 'Product Name' })
  name: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'HS Code', nullable: true })
  hsCode: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'EUDR Document Code', nullable: true })
  eudrDocumentCode: string;

  @Column({ allowNull: true, type: DataType.STRING })
  @Field(() => String, { description: 'S3 Key', nullable: true })
  s3Key: string;

  @ForeignKey(()=>Organization)
  @Column({ allowNull: false, type: DataType.INTEGER })
  @Field(() => Int, { nullable: false })
  orgId: number;

  @Column({ allowNull: true, type: DataType.ENUM("global","internal") })
  @Field(() => String, { description: 'Product type', nullable: true })
  productType: ProductType;

  @ForeignKey(()=>User)
  @Column({ allowNull: false })
  @Field(() => Int, { description: "user id" })
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

  @HasMany(() => ManageSubproduct,  { onDelete: 'CASCADE' })
  @Field(() => [ManageSubproduct], { nullable: 'itemsAndList', description: 'List of subproducts' })
  subproducts: ManageSubproduct[];

  @Field(() => Int, { nullable: true  })
  subproductCount: number;
}
