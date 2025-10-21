import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { DocumentCode } from '../entities/document-code.entity';
import { CreateDocumentCodeDto } from '../dto/create-document-code.input';
import { UpdateDocumentCodeDto } from '../dto/update-document-code.input';

@Injectable()
export class DocumentCodeService {
  constructor(
    @InjectModel(DocumentCode)
    private readonly documentCodeModel: typeof DocumentCode,
  ) {}
  
  async create(createDocumentCodeInput: CreateDocumentCodeDto): Promise<DocumentCode> {
    const existingDocumentCode = await this.documentCodeModel.findOne({
      where: { documentCode: createDocumentCodeInput.documentCode },
    });

    if (existingDocumentCode) {
      throw new ConflictException('Document code already exists');
    }
    return this.documentCodeModel.create(createDocumentCodeInput as any);
  }

  async findAll(): Promise<DocumentCode[]> {
    return this.documentCodeModel.findAll();
  }

  async findOne(id: number): Promise<DocumentCode> {
    const documentCode = await this.documentCodeModel.findByPk(id);
    if (!documentCode) {
      throw new NotFoundException('Document code not found');
    }
    return documentCode;
  }

  async update(id: number, createDocumentCodeInput: UpdateDocumentCodeDto): Promise<DocumentCode> {
    const documentCode = await this.findOne(id);
    return documentCode.update(createDocumentCodeInput);
  }

  async softDelete(id: number): Promise<void> {
    const documentCode = await this.findOne(id);
    await documentCode.destroy();
  }
}
