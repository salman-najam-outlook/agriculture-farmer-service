import { ObjectType, Field, Int, Directive, ID, registerEnumType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';
import { STRING } from 'sequelize';
import { DATE } from 'sequelize';
import { INTEGER } from 'sequelize';
import { BIGINT } from 'sequelize';
import { JSON } from 'sequelize';
import { Column, Table, Model } from 'sequelize-typescript';

export enum JobStatus {
  Pending = 'PENDING',
  Completed = 'COMPLETED',
  Failed = 'FAILED',
  Processing = 'PROCESSING',
  OnHold = 'ON HOLD',
}

registerEnumType(JobStatus, {
  name: 'JobStatus',
});

@Table({ tableName: 'jobs', timestamps: true })
@Directive('@key(fields: "id")')
@ObjectType()
export class Job extends Model {
  @Column({ primaryKey: true, autoIncrement: true, type: BIGINT })
  @Field(() => ID)
  id: number;

  @Column({ type: JSON })
  payload: Record<string, any>;

  @Column({ type: STRING, allowNull: true })
  @Field(() => String, { nullable: true })
  modelType?: string;

  @Column({ type: STRING, allowNull: true })
  @Field(() => String, { nullable: true })
  modelId?: string;

  @Column({ type: INTEGER.UNSIGNED, defaultValue: 0 })
  @Field(() => Int)
  availableAttempts: number;

  @Column({ type: DATE, allowNull: true })
  @Field(() => String, { nullable: true })
  reservedAt?: string;

  @Column({ type: DATE })
  @Field(() => String)
  availableAt: string;

  @Column({ type: STRING })
  @Field(() => JobStatus)
  status: JobStatus;

  @Column({ type: STRING, allowNull: true })
  @Field(() => String, { nullable: true })
  externalId?: string;

  @Column({ type: JSON, allowNull: true })
  @Field(() => GraphQLJSON, { nullable: true })
  context?: Record<string, any>;

  @Column({ type: INTEGER.UNSIGNED, defaultValue: 0 })
  @Field(() => Int)
  priority: number;
}
