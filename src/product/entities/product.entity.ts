import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { Column, Table, Model, HasMany } from 'sequelize-typescript';
import { SubProduct } from './sub-product.entity';

// pasture mgmt model is satellite report table
@Table({tableName: 'products'})
@ObjectType()
export class Product extends Model {
  @Column({ autoIncrement: true, primaryKey: true })
  @Field(() => ID, { description: 'satellite report coordinates id' })
  id: number;

  @Column
  @Field(() => String, {nullable: false })
  name: string

  @Column
  @Field(() => String, {nullable: false })
  description: string

  @Column
  @Field(() => String, {nullable: false })
  code: string

  @Field(() => [SubProduct], { nullable: true })
  @HasMany(() => SubProduct, {
    onDelete: 'CASCADE',
    hooks: true,
  })
  subProducts: SubProduct[];

}
