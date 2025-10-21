import { Field, InputType, ObjectType, Int } from '@nestjs/graphql';
import { IsNumber, IsOptional } from 'class-validator';
import { StatusLegendType } from '../../constants/status-legends.constant';

@InputType()
export class DdsReportSubmissionCountInput {
  @Field(() => Int)
  @IsNumber()
  year: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  organizationId?: number;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  subOrganizationId?: number;

  @Field(() => [Int], { nullable: true })
  @IsOptional()
  products?: number[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  cfRoles?: string[];
}

@ObjectType()
export class StatusCount {
  @Field(() => String)
  status: StatusLegendType;

  @Field(() => Int)
  count: number;
}

@ObjectType()
export class MonthlyStatusCount {
  @Field(() => String)
  month: string;

  @Field(() => [StatusCount])
  statusCounts: StatusCount[];
}

@ObjectType()
export class DdsReportSubmissionCount {
  @Field(() => Int)
  totalCount: number;

  @Field(() => [StatusCount])
  statusCounts: StatusCount[];

  @Field(() => [MonthlyStatusCount])
  monthlyStatusCounts: MonthlyStatusCount[];
}