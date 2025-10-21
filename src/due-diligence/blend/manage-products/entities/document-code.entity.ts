import { Column, Model, Table, CreatedAt, UpdatedAt, DeletedAt, DataType } from 'sequelize-typescript';
import { Field, ID, ObjectType } from '@nestjs/graphql';

@Table({ tableName: 'document_codes', timestamps: true, paranoid: true })
@ObjectType()
export class DocumentCode extends Model {
  @Column({ primaryKey: true, autoIncrement: true })
  @Field(() => ID, { description: 'ID' })
  id: number;

  @Column({ allowNull: false })
  @Field(() => String, { description: 'Document Code' })
  documentCode: string;

  @Column({ allowNull: false })
  @Field(() => String, { description: 'Title' })
  title: string;

  @Column({ type: DataType.TEXT, allowNull: true })
  @Field(() => String, { nullable: true, description: 'Description' })
  description: string;

  @CreatedAt
  @Column({ field: 'createdAt' })
  @Field(() => Date, { nullable: true, description: 'Creation Date' })
  createdAt: Date;

  @UpdatedAt
  @Column({ field: 'updatedAt' })
  @Field(() => Date, { nullable: true, description: 'Last Update Date' })
  updatedAt: Date;

  @DeletedAt
  @Column({ field: 'deletedAt' })
  @Field(() => Date, { nullable: true, description: 'Deletion Date' })
  deletedAt: Date;
}
