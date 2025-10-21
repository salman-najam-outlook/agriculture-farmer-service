import { InputType, Int, Field } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { INTEGER } from 'sequelize';

// let locationInfo : {coordinates: Array<any>}

@InputType()
class coordinatesObj {
  @Field(() => String, { nullable: false })
  lat: string;

  @Field(() => String, { nullable: false })
  log: string;
}
@InputType()
class locationInfo {
  @Field(() => String, { nullable: false })
  type: string;

  @Field(() => [coordinatesObj], { nullable: false })
  coordinates: [coordinatesObj];
}
@InputType()
export class CreatePastureMgmtInput {
  @Field(() => String, { nullable: false })
  dateOfInterest: string;

  @Field(() => String, { nullable: true })
  createdAt: string;


  @Field(() => locationInfo, { nullable: false })
  locationInfo: locationInfo;

  @Field(() => Int, { nullable: true })
  userId: number;

  @Field(() => String, { nullable: false })
  locationName: string;

  @Field(() => Int, { nullable: true })
  segment: number;
}

export class PastureReportRequest {
  @IsOptional()
  @Type(() => Number)
  page: number;

  @IsOptional()
  @Type(() => Number)
  userId: number;

  @Type(() => Number)
  @IsOptional()
  size: number;

  @Type(() => String)
  @IsOptional()
  status: string;

  @Type(() => Date)
  @IsOptional()
  createdAt: Date;

  @Type(() => Date)
  @IsOptional()
  dateOfInterest: Date;
}
