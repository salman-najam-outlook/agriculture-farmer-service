import {ObjectType, Field, Int, ID, Float} from '@nestjs/graphql';
import {Column, Table, Model, HasMany, DataType, BelongsTo, ForeignKey, BelongsToMany } from 'sequelize-typescript';
import {DATE} from "sequelize";
import { UserDDS } from '../../users/entities/dds_user.entity';

@Table({tableName: 'dds_report_exporter'})
@ObjectType()
export class DdsReportExporter extends Model {
    @Column({ autoIncrement: true, primaryKey: true })
    @Field(() => ID, { description: 'deligence id' })
    id: number;

    @Field(() => Int, {nullable:true})
    @Column
    diligence_report_id: number;

    @Field(() => Int)
    @ForeignKey(() => UserDDS)
    @Column
    exporter_id: number;


    @Field(() => Int)
    @ForeignKey(() => UserDDS)
    @Column
    shared_by: number;

    @Field(() => Int, {nullable:true})
    @Column
    exporter_cf_id: number;

    @Field(() => Int, {nullable:true})
    @Column
    shared_by_cf_id: number;
    
    @Column({ type: DATE})
    @Field(() => Date, {nullable: true })
    createdAt: Date;

    @Column({ type: DATE})
    @Field(() => Date, {nullable: true })
    updatedAt: Date;

}
