import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { DocumentCodeService } from '../services/document-code.service';
import { DocumentCode } from '../entities/document-code.entity';
import { CreateDocumentCodeDto } from '../dto/create-document-code.input';
import { UpdateDocumentCodeDto } from '../dto/update-document-code.input';

@Resolver(() => DocumentCode)
export class DocumentCodeResolver {
  constructor(private readonly documentCodeService: DocumentCodeService) {}

  @Query(() => [DocumentCode], { name: 'documentCodes' })
  findAll() {
    return this.documentCodeService.findAll();
  }

  @Query(() => DocumentCode, { name: 'documentCode' })
  findOne(@Args('id', { type: () => ID }) id: number) {
    return this.documentCodeService.findOne(id);
  }

  @Mutation(() => DocumentCode)
  createDocumentCode(@Args('createDocumentCodeInput') createDocumentCodeInput: CreateDocumentCodeDto) {
    return this.documentCodeService.create(createDocumentCodeInput);
  }

  @Mutation(() => DocumentCode)
  updateDocumentCode(@Args('updateDocumentCodeInput') updateDocumentCodeInput: UpdateDocumentCodeDto) {
    return this.documentCodeService.update(updateDocumentCodeInput.id, updateDocumentCodeInput);
  }

  @Mutation(() => Boolean)
  async deleteDocumentCode(@Args('id', { type: () => ID }) id: number): Promise<boolean> {
    await this.documentCodeService.softDelete(id);
    return true;
  }
}
