import { InputType, Int, Field, ObjectType, Float } from '@nestjs/graphql';
import { IsInt, IsNumber, IsOptional, IsString } from 'class-validator';
import { ShipmentDueDeligenceReport } from '../entities/shipment-duedeligence-report.entity';
import { UserDDS } from '../../users/entities/dds_user.entity';

@ObjectType()
export class ShipmentList {
  @IsInt()
  @Field(() => Int, { nullable: true })
  id?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  reportCount?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  farmCount?: number;

  @IsOptional()
  @IsNumber()
  @Field(() => Float, { nullable: true })
  totalQuantity?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  status?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  statusLegends?: string;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isTemporaryApproval?: boolean;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  temporaryExpirationDate?: Date;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  temporaryExpirationValue?: number;

  @IsOptional()
  @Field(() => String, { nullable: true })
  temporaryExpirationUnit?: string;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  assignedTo?: number;

  @IsOptional()
  @Field(() => Int, { nullable: true })
  assignedToCfId?: number;

  @IsOptional()
  @Field(() => Date, { nullable: true })
  assignedDate?: Date;

  @IsOptional()
  @Field(() => String, { nullable: true })
  rejectionReason?: string;

  @IsOptional()
  @Field(() => UserDDS, { nullable: true })
  assignedToUser?: UserDDS;

  @IsOptional()
  @Field(() => [ShipmentDueDeligenceReport] , {nullable:true})
  shipmentReports:ShipmentDueDeligenceReport[]
}
@ObjectType()
export class ShipmentListResponse {
  @IsInt()
  @Field(() => Int, { nullable: true })
  count?: number;

  @IsOptional()
  @Field(() => [ShipmentList], { nullable: true })
  rows?: ShipmentList[];   
}


@InputType()
export class GetAllShipmentListInput  {
  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  page?: number;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  limit?: number;

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  search?: string;

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  assignedTo?: number;

  @IsOptional()
  @Field(() => [Int], { nullable: true })
  assignedToIds?: number[];

  @Field(() => String, { nullable: true })
  orderField?: string

  @Field(() => String, { nullable: true })
  order?: string

  @Field(() => [String], { nullable:false })
  cfroles?:string[]

  @IsOptional()
  @IsString()
  @Field(() => String, { nullable: true })
  status?: string

  @IsOptional()
  @IsInt()
  @Field(() => Int, { nullable: true })
  cooperativeId?: number;
}