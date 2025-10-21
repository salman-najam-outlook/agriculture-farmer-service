import { ObjectType, Field, Int } from '@nestjs/graphql';
import {
  BelongsTo,
  Column,
  CreatedAt,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript';
import { RiskAssessmentLevels } from './risk-assessment-levels.entity';
import { RenewalType, UserType } from '../dto/create-eudr-setting.input';
import { DeclarationStatements } from './declaration-statements.entity';
import { DeforestationAssessmentRiskToleranceLevels } from './deforestation-assessment-risk-tolerance-levels.entity';

@ObjectType()
@Table({ tableName: 'eudr_settings' })
export class EudrSetting extends Model {
  @Field(() => Int)
  @PrimaryKey
  @Column({ primaryKey: true, autoIncrement: true, type: DataType.INTEGER })
  id: number;

  @Column({ allowNull: true, field: 'radius_unit' })
  @Field(() => String, { nullable: true })
  radius_unit: string;

  @Column({ allowNull: true, field: 'org_id' })
  @Field(() => Int, { nullable: false })
  org_id: number;

  @Column({ allowNull: true, field: 'radius_max_limit' })
  @Field(() => Number, { nullable: true })
  radius_max_limit: number;

  @Column({ allowNull: true, field: 'isDefault' })
  @Field(() => Boolean, { nullable: true })
  isDefault: boolean;

  @Column({ allowNull: true, field: 'product_mass_unit' })
  @Field(() => String, { nullable: true })
  product_mass_unit: string;

  @Column({ allowNull: true, field: 'volume_unit' })
  @Field(() => String, { nullable: true })
  volume_unit: string;

  @Column({ allowNull: true, defaultValue: UserType.OPERATOR })
  @Field(() => String, { nullable: true })
  user_type: UserType;

  @Column({ allowNull: true, field: 'eudr_api_key' })
  @Field(() => String, { nullable: true })
  eudr_api_key: string;

  @Column({ allowNull: true, field: 'eudr_api_secret' })
  @Field(() => String, { nullable: true })
  eudr_api_secret: string;

  @ForeignKey(() => RiskAssessmentLevels)
  @Column({ allowNull: true, field: 'risk_mitigation_level_id' })
  @Field(() => Int, { nullable: true })
  risk_mitigation_level_id: number;

  @Field(() => RiskAssessmentLevels, { nullable: true })
  @HasOne(() => RiskAssessmentLevels)
  riskLevel: RiskAssessmentLevels;
  
  @Field(() => DeforestationAssessmentRiskToleranceLevels, { nullable: true })
  @HasOne(() => DeforestationAssessmentRiskToleranceLevels)
  riskToleranceLevels: DeforestationAssessmentRiskToleranceLevels;
  
  @Column({ allowNull: true, field: 'dynamicExpiryTime' })
  @Field(() => Number, { nullable: true })
  dynamicExpiryTime: number;

  @Column({ allowNull: true, field: 'dynamicExpiryTimePeriod' })
  @Field(() => String, { nullable: true })
  dynamicExpiryTimePeriod: string;

  @Column({ allowNull: true, defaultValue: RenewalType.AUTO })
  @Field(() => String, { nullable: true })
  toggleAutoRenewWhenReportAdded: RenewalType;

  @Column({ allowNull: true, field: 'declarationStatementCountry' })
  @Field(() => String, { nullable: true })
  declarationStatementCountry: string;

  @Field(() => [DeclarationStatements], { nullable: true })
  @HasMany(() => DeclarationStatements)
  declarations: DeclarationStatements[];

  @CreatedAt
  @Column({ allowNull: true, field: 'createdAt' })
  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @UpdatedAt
  @Column({ allowNull: true, field: 'updatedAt' })
  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  public_geofence_download: boolean;

  @Column({ allowNull: true })
  @Field(() => Boolean, { nullable: true })
  public_deforestation_summary: boolean;
}
