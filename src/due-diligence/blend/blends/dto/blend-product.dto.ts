
import { Field, ID, ObjectType, Int } from '@nestjs/graphql';
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import { ManageProduct } from '../../manage-products/entities/manage-products.entity';
import { ManageSubproduct } from '../../manage-products/entities/manage-subproduct.entity';

@ObjectType()
export class BlendProductDto {
  @Field(() => ID, { description: 'blend product ID' })
  id: number;

  @Field(() => String, {nullable: true })
  supplierId: string

  @Field(() => User, { nullable:true })
  supplier: User;

  @Field(() => String, {nullable: true })
  internalReferenceNumber: string

  @Field(() => String, {nullable: true })
  activity: string

  @Field(() => [String], {nullable: true })
  countryOfActivity: string[]

  @Field(() => String, {nullable: true })
  countryOfEntry: string

  @Field(() => String, { nullable: true })
  productName: string;

  @Field(() => String, {nullable: true })
  subProduct: string

  @Field(() => ManageSubproduct, { nullable:true })
  subProductDetail: ManageSubproduct;

  @Field(() => String, {nullable: true })
  productNetMass: string

  @Field(() => String, {nullable: true })
  productVolume: string

  @Field(() => Date, { nullable: true })
  productDate: Date;

  @Field(() => String, {nullable: true })
  EUDRReferenceNumber: string

  @Field(() => String, {nullable: true })
  containerId: string;

  @Field(() => Boolean, { nullable: false, defaultValue: false })
  availability: boolean;

  @Field(() => String, {nullable: true, defaultValue: "Pending" })
  status: string

  @Field(() => String, {nullable: true })
  type: string

  @Field(() => Int, {nullable:true})
  productionPlaceCount: number

  @Field(() => String, {nullable: true })
  productType: string

  @Field(() => Date, { nullable: true })
  createdAt: Date;


  @Field(() => Date, { nullable: true })
  updatedAt: Date;
  
  @Field(()=> Number, {nullable: true})
  index: number
}
