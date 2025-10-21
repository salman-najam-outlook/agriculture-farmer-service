import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { FileType } from "./FileType";

// @ObjectType("FileTypeAdditionalSettingsOutputType")
// export class FileTypeAdditionalSettingsOutputType{
//   @Field(() => [FileType], {nullable: true})
//   allowedFileTypes: FileType[];

//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   allowMultipleAttachments: boolean;

//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   allowComments: boolean;
// }

// @InputType()
// export class FileTypeAdditionalSettingsInputType{
//   @Field(() => [FileType], {nullable: true})
//   allowedFileTypes: FileType[];

//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   allowMultipleAttachments: boolean;

//   @Field(() => Boolean, { nullable: true, defaultValue: false })
//   allowComments: boolean;
// }

@InputType("FileTypeAdditionalSettingsInputType")
@ObjectType("FileTypeAdditionalSettingsObjectType")
export class FileTypeAdditionalSettings {
  @Field(() => [FileType], { nullable: true })
  allowedFileTypes: FileType[];

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  allowMultipleAttachments: boolean;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  allowComments: boolean;
}
