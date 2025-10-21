import { InputType, Int, Field, ObjectType } from "@nestjs/graphql";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { RiskAssessmentLevels } from "../entities/risk-assessment-levels.entity";
import { DeclarationStatements } from "../entities/declaration-statements.entity";

export enum UserType {
  OPERATOR = "operator",
  SUPPLIER = "supplier",
}

export enum RenewalType {
  AUTO = "auto",
  AUTOWHENADDED = "autoWhenAdded",
}

@InputType()
export class RiskLevel {
  @Field(() => Boolean, { nullable: true })
  high: boolean;

  @Field(() => Boolean, { nullable: true })
  low: boolean;

  @Field(() => Boolean, { nullable: true })
  medium: boolean;

  @Field(() => Boolean, { nullable: true })
  very_high: boolean;

  @Field(() => Boolean, { nullable: true })
  very_low: boolean;

  @Field(() => Boolean, { nullable: true })
  zero: boolean;

}
@InputType()
export class RiskToleranceLevels {
  @Field(() => Int, { nullable: true, defaultValue: 0 })
  high: number;

  @Field(() => Int, { nullable: true, defaultValue: 0  })
  low: number;

  @Field(() => Int, { nullable: true, defaultValue: 0  })
  medium: number;

  @Field(() => Int, { nullable: true, defaultValue: 0  })
  very_high: number;

  @Field(() => Int, { nullable: true, defaultValue: 0  })
  very_low: number;

}

@InputType()
export class Declaration {
  @Field(() => String, { nullable: true })
  title: string;

  @Field(() => String, { nullable: true })
  country: string;

  @Field(() => String, { nullable: true })
  description: string;

  @Field(() => Boolean, { nullable: true })
  isEnabled: boolean;
}

@ObjectType()
export class EudrSettingOutput {
  @Field(() => Number)
  id: number;

  @Field(() => Number)
  org_id: number;

  @Field(() => String , { nullable: true })
  radius_unit: string;

  @Field(() => Number , { nullable: true })
  radius_max_limit: number;

  @Field(() => Boolean , { nullable: true })
  isDefault: boolean;

  @Field(() => String , { nullable: true })
  product_mass_unit: string;

  @Field(() => String , { nullable: true })
  volume_unit: string;

  @Field(() => String , { nullable: true })
  user_type: string;

  @Field(() => String , { nullable: true })
  eudr_api_key: string;

  @Field(() => String , { nullable: true })
  eudr_api_secret: string;

  @Field(() => RiskAssessmentLevels , { nullable: true })
  riskLevel: RiskAssessmentLevels;

  @Field(() => RiskToleranceLevels , { nullable: true })
  riskToleranceLevels: RiskToleranceLevels;

  @Field(() => Number , { nullable: true })
  dynamicExpiryTime: number;

  @Field(() => String , { nullable: true })
  dynamicExpiryTimePeriod: string;

  @Field(() => String , { nullable: true })
  toggleAutoRenewWhenReportAdded: string;

  @Field(() => String , { nullable: true })
  declarationStatementCountry: string;

  @Field(() => [DeclarationStatements], { nullable: true })
  declarations: DeclarationStatements[];
}

@InputType()
export class CreateEudrSettingInput {
  @IsString()
  @Field(() => String, { nullable: true })
  radius_unit: string;

  @Field(() => Number, { nullable: true })
  radius_max_limit: number;

  @Field(() => Boolean, { nullable: true })
  isDefault: boolean;

  @IsString()
  @Field(() => String, { nullable: true })
  product_mass_unit: string;

  @IsString()
  @Field(() => String, { nullable: true })
  volume_unit: string;

  @IsString()
  @Field(() => String, { nullable: true })
  user_type: string;

  @IsString()
  @Field(() => String, { nullable: true })
  eudr_api_key: string;

  @IsString()
  @Field(() => String, { nullable: true })
  eudr_api_secret: string;

  @Type(() => RiskLevel)
  @Field(() => RiskLevel, { nullable: true })
  risk_level: RiskLevel;
  
  @Field(() => RiskToleranceLevels , { nullable: true })
  riskToleranceLevels: RiskToleranceLevels;

  @Field(() => Number, { nullable: true })
  dynamicExpiryTime: number;

  @Field(() => String, { nullable: true })
  dynamicExpiryTimePeriod: string;

  @Field(() => String, { nullable: true })
  toggleAutoRenewWhenReportAdded: string;

  @IsString()
  @Field(() => String, { nullable: true })
  declarationStatementCountry: string;

  @Type(() => Declaration)
  @Field(() => [Declaration], { nullable: true })
  declarations: Declaration[];

  @Field(() => Boolean, { nullable: true })
  public_geofence_download: boolean;

  @Field(() => Boolean, { nullable: true })
  public_deforestation_summary: boolean;
}
