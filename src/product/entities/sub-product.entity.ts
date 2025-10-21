import { ObjectType, Field, ID } from '@nestjs/graphql';
import { INTEGER } from 'sequelize';
import {  Column, ForeignKey, Table, Model } from 'sequelize-typescript';
import { Product } from './product.entity';

// pasture mgmt model is satellite report table
@Table({tableName: 'sub_products'})
@ObjectType()
export class SubProduct extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'satellite report coordinates id' })
  id: number;

  @Column({ type: INTEGER })
  @ForeignKey(() => Product)
  @Field(() => Product)
  productId: number;
  
  @Column
  @Field(() => String, {nullable: false })
  name: string

  @Column
  @Field(() => String, {nullable: false })
  description: string

  @Column
  @Field(() => String, {nullable: false })
  code: string

}
