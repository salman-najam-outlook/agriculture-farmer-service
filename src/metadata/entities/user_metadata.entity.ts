import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BelongsTo, Column, CreatedAt, ForeignKey, Model, Table } from "sequelize-typescript";
import { UserDDS } from "src/users/entities/dds_user.entity";

@Table({ tableName: 'user_metadata', timestamps: false })
@ObjectType()
export class UserMetadata extends Model {
    @Column({ primaryKey: true, allowNull: false, autoIncrement: true })
    @Field(() => Int, { description: "Client Metadata Record ID" })
    id: number;

    @Column
    @Field({ description: 'IP Address', nullable: true })
    ipAddress: string;

    @Column
    @Field({ description: 'Referer', nullable: true })
    referer: string;

    @Column
    @Field({ description: 'User Agent', nullable: true })
    userAgent: string;

    @Column
    @Field({ description: 'Screen Size', nullable: true })
    screenSize: string;

    @Column
    @Field({ description: 'Timezone', nullable: true })
    timezone: string;

    @Column
    @Field({ description: 'Language', nullable: true })
    lang: string;
    
    @Column
    @ForeignKey(() => UserDDS)
    @Field(() => Int, { description: 'User ID', nullable: true })
    userId: number;

    @CreatedAt 
    createdAt: Date;

    @BelongsTo(() => UserDDS)
    user: UserDDS;
}