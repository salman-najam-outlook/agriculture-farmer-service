import { InputType, Field, Int, Float } from '@nestjs/graphql';
import { IsString } from 'class-validator';

@InputType({ description: 'Update Blend Input' })
export class UpdateBlendInput {
  @Field(() => String, { nullable: true, description: 'Name of the blend' })
  name?: string;

  @Field(() => String, { nullable: true, description: 'Description of the blend' })
  description?: string;

  @Field(() => String, { nullable: true, description: 'code of the blend' })
  blendCode?:string

  @Field()
  blendStatus?: string;

  @Field(() => Float, { nullable: true, description: 'Net mass in kilograms' })
  netMass?: number;

  @Field(() => Float, { nullable: true, description: 'Volume in cubic meters' })
  volume?: number;

  @Field(() => String, { nullable: true, description: 'Blend Lot ID' })
  blendLotId?: string;

  @Field(() => String, { nullable: true, description: 'Finished Product Lot ID' })
  finishedProductLotId?: string;

  @Field(() => Boolean, { nullable: true, description: 'Continue later flag' })
  continueLater?: boolean;

  @Field(() => String, { nullable: true, description: 'Internal reference number' })
  internalReferenceNumber?: string;

  @Field(() => Int, { nullable: true, description: 'Company ID associated with the blend' })
  companyId?: number;

  @Field(() => [String], { nullable: true, description: 'Country of entry' })
  countryOfEntry?: string[];

  @Field(() => String, { nullable: true, description: 'Country of activity' })
  countryOfActivity?: string;

  @Field(() => String, { nullable: true, description: 'EUDR reference number' })
  eudrReferenceNumber?: string;

  @Field(() => Int, { nullable: true, description: 'Blend settings ID' })
  blendSettingId?: number;

  @Field(() => [String], { nullable: true, description: 'List of container IDs to associate with the blend' })
  containerIds?: string[];

  @Field(() => [UpdateBlendProductInput], { nullable: true, description: 'List of blend products to associate with the blend' })
  blendProducts?: UpdateBlendProductInput[];
}

@InputType({ description: 'Blend Product Input for Update' })
export class UpdateBlendProductInput {
  @Field(() => Int, { nullable: true, description: 'Unique identifier for the blend product' })
  id?: number;

  @Field(() => Int, { nullable: true, description: 'Product ID associated with the blend product' })
  productId?: number;

  @Field(() => Int, { nullable: true, description: 'Sub-product ID associated with the blend product' })
  subProductId?: number;

  @Field(() => Int, { nullable: true, description: 'Exempt product ID associated with the blend product' })
  exemptProductId?: number;

  @Field(() => Boolean, { nullable: true, description: 'Availability of the blend product' })
  availability?: boolean;

  @Field(() => String, { nullable: true, description: 'Container ID of the blend product' })
  containerId?: string;

  @Field(() => String, { nullable: true, description: 'Due diligence status of the blend product' })
  dueDiligenceStatus?: string;

  @Field(() => Date, { nullable: true, description: 'Submission date of the blend product' })
  submissionDate?: Date;

  @Field(() => String, { description: 'product type', nullable: false })
  @IsString()
  productType?:string
}
