import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsISO31661Alpha2, ValidateNested, ArrayMinSize, IsArray, IsOptional } from 'class-validator';

export class SolanaCropYieldInput {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  farm: string;

  @IsNotEmpty()
  @IsString()
  @IsISO31661Alpha2()
  country: string;

  @IsNotEmpty()
  @IsString()
  crop: string;
}

export class SolanaCropYieldInputs {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SolanaCropYieldInput)
  items: SolanaCropYieldInput[];

  @IsOptional()
  @IsString()
  transactableType?: string;
}
