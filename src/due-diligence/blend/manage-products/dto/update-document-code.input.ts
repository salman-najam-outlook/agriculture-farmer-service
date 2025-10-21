import { Field, InputType, ID, PartialType } from '@nestjs/graphql';
import { CreateDocumentCodeDto } from './create-document-code.input';

@InputType()
export class UpdateDocumentCodeDto extends PartialType(CreateDocumentCodeDto) {
  @Field(() => ID)
  id: number;
}