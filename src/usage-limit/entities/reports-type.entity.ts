import {Column, DataType, Model, Table} from "sequelize-typescript";
import {Field, Int, ObjectType} from "@nestjs/graphql";

@Table({ tableName: "reports_type",timestamps:false })
@ObjectType()
export class ReportsType extends Model {
    @Column({autoIncrement: true, primaryKey: true})
    @Field(() => Int)
    id: number;

    @Column({ allowNull: false, type: DataType.STRING })
    @Field(() => String, { nullable: false })
    name: string;

    @Column({ allowNull: false, type: DataType.STRING })
    @Field(() => String, { nullable: false })
    description: string;

}