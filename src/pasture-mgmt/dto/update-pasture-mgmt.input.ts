import { CreatePastureMgmtInput } from './create-pasture-mgmt.input';
import { InputType, Field, Int, PartialType } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

@InputType()
export class UpdatePastureMgmtInput extends PartialType(
  CreatePastureMgmtInput,
) {
  @Field(() => Int)
  id: number;
}

export class UpdatePastureReport {
  @IsOptional()
  inputImage: string;
  @IsOptional()
  geoImagePath: string;
  @IsOptional()
  shortImagePath: string;
  @IsOptional()
  reportPDFPath: string;
  @IsOptional()
  reportS3Key: string;
  @IsOptional()
  reportName: string;
  @IsOptional()
  status: string;
}
