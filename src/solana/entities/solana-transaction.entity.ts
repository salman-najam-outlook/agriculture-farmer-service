import { Field, ObjectType } from '@nestjs/graphql';
import { Column, CreatedAt, DataType, Model, Table } from 'sequelize-typescript';

@ObjectType()
@Table({ tableName: 'solana_transactions', timestamps: false })
export class SolanaTransaction extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @Column({ field: 'transactionSignature', allowNull: true })
  @Field(() => String, { nullable: true })
  transactionSignature: string;

  @Column({ field: 'transactableType' })
  @Field(() => String, { nullable: false })
  transactableType: string;

  @Column({ field: 'transactableId' })
  @Field(() => String, { nullable: false })
  transactableId: string;

  @Column({ field: 'attempts', type: DataType.SMALLINT({ unsigned: true }), defaultValue: 1 })
  @Field(() => Number, { nullable: false, defaultValue: 1 })
  attempts: number;

  @Column({ field: 'isSuccess' })
  @Field(() => Boolean, { nullable: false })
  isSuccess: boolean;

  @Column({ field: 'status', type: DataType.STRING, defaultValue: 'processing' })
  @Field(() => String, { nullable: false, defaultValue: 'processing' })
  status: 'processing' | 'success' | 'failed';

  @Column({ field: 'error', type: DataType.JSON, allowNull: true })
  @Field(() => String, { nullable: true })
  error: string;

  @Column({ allowNull: true, field: 'transactionDate' })
  @Field(() => String, { nullable: true })
  transactionDate: Date;

  @Column({ allowNull: true, type: DataType.INTEGER({ unsigned: true }), field: 'transactionFee' })
  @Field(() => Number, { nullable: true })
  transactionFee: number;

  @Column({ allowNull: false, type: DataType.JSON, field: 'transactionData' })
  @Field(() => String, { nullable: false })
  transactionData: string;

  @Column({ allowNull: true, type: DataType.JSON, field: 'transactionDetails' })
  @Field(() => String, { nullable: true })
  transactionDetails: string;

  @CreatedAt
  @Column({ allowNull: true, field: 'createdAt' })
  @Field(() => String, { nullable: true })
  createdAt: Date;
}
