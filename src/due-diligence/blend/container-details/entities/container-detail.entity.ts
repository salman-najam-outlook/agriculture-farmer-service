import { Field, ID, ObjectType, Int,   } from '@nestjs/graphql';
import { Table, Column, Model, CreatedAt, UpdatedAt, ForeignKey , DeletedAt} from 'sequelize-typescript';
import { ExemptProduct } from '../../exempt-products/entities/exempt-product.entity';
import { Blend } from '../../blends/entities/blend.entity';

@Table({ tableName: 'container_details', paranoid: true })  // paranoid: true enables soft delete
@ObjectType()
export class ContainerDetail extends Model {
  @Column({ primaryKey: true, })
  @Field(() => ID, { description: 'Container ID' })
  id: number;

  @ForeignKey(() => ExemptProduct)
  @Column
  @Field(() => Int, { description: "exempt product id" })
  exemptProductId: number

  @ForeignKey(() => Blend)
  @Field(() => Int, {nullable: true })
  blendId: number

  @Column
  @Field(() => String, {nullable: true })
  containerId: string

  @CreatedAt
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @DeletedAt
  @Field(() => Date, { nullable: true })
  deletedAt: Date;  // Timestamp for soft delete
}
