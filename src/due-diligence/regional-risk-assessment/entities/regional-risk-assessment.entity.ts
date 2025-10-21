import { Column, Model, Table, CreatedAt, UpdatedAt, DeletedAt, DataType } from 'sequelize-typescript';
import { Field, ID, ObjectType } from '@nestjs/graphql';
import { RiskCriteriaLevel } from '../dto/risk-assessment-criteria-level.enum';
import GraphQLJSON from 'graphql-type-json';

@Table({ tableName: 'regional_risk_assessment', timestamps: true, paranoid: true })
@ObjectType()
export class RegionalRiskAssessment extends Model {
    @Column({ primaryKey: true, autoIncrement: true })
    @Field(() => ID, { description: 'ID' })
    id: number;

    @Column({ type: DataType.STRING, allowNull: false, unique: true })
    @Field(() => String, { description: 'Country' })
    country: string;
        
    @Column({ type: DataType.JSON, allowNull: false })
    @Field(() => GraphQLJSON, { description: 'Risk Criteria Levels' })
    riskCriteriaIdWithLevels: Record<number, RiskCriteriaLevel>;
  
    @Column({ type: DataType.TEXT, allowNull: true })
    @Field(() => String, { nullable: true, description: 'Report Details (Rich Text)' })
    reportDetails: string;

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
