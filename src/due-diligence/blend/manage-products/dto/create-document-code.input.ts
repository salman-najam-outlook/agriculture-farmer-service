import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateDocumentCodeDto {
  @Field(() => String)
  documentCode: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;
}