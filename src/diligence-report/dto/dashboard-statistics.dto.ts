import { InputType, Field, ObjectType, Int } from '@nestjs/graphql';
import { IsOptional, IsString, IsInt, IsDateString, IsArray } from 'class-validator';

@InputType()
export class DashboardStatisticsDto {
  @Field(() => String, { nullable: true, description: 'Filter type: today, week, month, year, or custom' })
  @IsOptional()
  @IsString()
  filterType?: string;

  @Field(() => String, { nullable: true, description: 'Start date for filtering (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @Field(() => String, { nullable: true, description: 'End date for filtering (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @Field(() => [String], { nullable: true, description: 'Filter by regions/countries' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  regions?: string[];

  @Field(() => [Int], { nullable: true, description: 'Filter by product IDs' })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  products?: number[];

  @Field(() => Int, { nullable: true, description: 'Organization ID (optional, retrieved from token)' })
  @IsOptional()
  @IsInt()
  organizationId?: number;

  @Field(() => Int, { nullable: true, description: 'Sub-organization ID (optional)' })
  @IsOptional()
  @IsInt()
  subOrganizationId?: number;

  @Field(() => Int, { nullable: true, description: 'User ID for "Assigned to Me" filter' })
  @IsOptional()
  @IsInt()
  userId?: number;

  @Field(() => [String], { nullable: true, description: 'CF Roles for role-based filtering' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cfRoles?: string[];

  @Field(() => Int, { nullable: true, description: 'State ID for filtering by state from users_dds table' })
  @IsOptional()
  @IsInt()
  stateId?: number;
}

@ObjectType()
export class DashboardStatisticsResponse {
  @Field(() => Int, { description: 'Number of DDS compliant reports' })
  ddsCompliant: number;

  @Field(() => Int, { description: 'Number of non-compliant DDS reports' })
  ddsNonCompliant: number;

  @Field(() => Int, { description: 'Number of approved DDS reports' })
  ddsApproved: number;

  @Field(() => Int, { description: 'Number of overdue DDS reports' })
  ddsOverdue: number;

  @Field(() => Int, { description: 'Number of DDS reports assigned to me' })
  ddsAssignedToMe: number;

  @Field(() => String, { nullable: true, description: 'Percentage change for DDS compliant' })
  ddsCompliantChange?: string;

  @Field(() => String, { nullable: true, description: 'Percentage change for DDS non-compliant' })
  ddsNonCompliantChange?: string;

  @Field(() => String, { nullable: true, description: 'Percentage change for DDS approved' })
  ddsApprovedChange?: string;

  @Field(() => String, { nullable: true, description: 'Percentage change for DDS overdue' })
  ddsOverdueChange?: string;

  @Field(() => String, { nullable: true, description: 'Percentage change for DDS assigned to me' })
  ddsAssignedToMeChange?: string;

  @Field(() => Int, { description: 'Total number of registered farms' })
  registeredFarms: number;

  @Field(() => String, { nullable: true, description: 'Percentage change for registered farms' })
  registeredFarmsChange?: string;

  @Field(() => Int, { description: 'Number of active exporters' })
  activeExporters: number;

  @Field(() => String, { nullable: true, description: 'Percentage change for active exporters' })
  activeExportersChange?: string;

  @Field(() => Int, { description: 'Number of active cooperatives' })
  activeCooperatives: number;

  @Field(() => String, { nullable: true, description: 'Percentage change for active cooperatives' })
  activeCooperativesChange?: string;
}