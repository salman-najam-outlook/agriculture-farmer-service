import { Field, InputType, ObjectType } from "@nestjs/graphql";

// @ObjectType()
// export class DigitalSignatureTypeAdditionalSettingsOutputType  {
//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   uploadSignatureFile: string;

//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   drawSignature?: boolean;
// }

// @InputType()
// export class DigitalSignatureTypeAdditionalSettingsInputType  {
//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   uploadSignatureFile: string;

//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   drawSignature?: boolean;
// }

@InputType("DigitalSignatureTypeAdditionalSettingsInputType")
@ObjectType("DigitalSignatureTypeAdditionalSettingsOutputType")

export class DigitalSignatureTypeAdditionalSettings  {
  @Field(() => Boolean, { nullable: true, defaultValue: false })
  uploadSignatureFile: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  drawSignature?: boolean;
}
