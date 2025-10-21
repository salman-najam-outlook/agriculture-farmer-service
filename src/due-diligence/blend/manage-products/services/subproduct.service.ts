import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ManageSubproduct, SubProductType } from '../entities/manage-subproduct.entity';
import { CreateManageSubproductDto } from '../dto/create-manage-subproduct.input';
import { UpdateManageSubproductDto } from '../dto/update-manage-subproduct.input';
import { Op } from 'sequelize';
import { ManageSubProductFilterInput, ManageSubProductPaginatedResponse } from '../dto/manage-sub-product-filter.input';

@Injectable()
export class SubproductService {
  constructor(
    @InjectModel(ManageSubproduct) private readonly subproductModel: typeof ManageSubproduct,
  ) { }

  async createSubProduct(createSubProductInput: CreateManageSubproductDto, userId: any, organizationId: any): Promise<ManageSubproduct> {
    let manageSubProductInput: any = {
      ...createSubProductInput,
      createdBy: parseInt(userId),
      orgId: parseInt(organizationId),
  };
    return this.subproductModel.create(manageSubProductInput);
  }

  async update(id: number, createSubProductInput: UpdateManageSubproductDto): Promise<ManageSubproduct> {
    const subProduct = await this.subproductModel.findByPk(id);
    
    if (!subProduct) {
      throw new BadRequestException('SubProduct not found');
    }
    
    if ((subProduct.subProductType === SubProductType.GLOBAL) && createSubProductInput.name) {
      throw new BadRequestException('Editing the name of global sub-products is not allowed');
    }

    await this.subproductModel.update(createSubProductInput, { where: { id } });
    return this.subproductModel.findByPk(id);
  }

  async softDelete(id: number): Promise<void> {
    const subproduct = await this.subproductModel.findByPk(id);

    if (!subproduct) {
      throw new BadRequestException('SubProduct not found');
    }

     if (subproduct.subProductType === SubProductType.GLOBAL) {
      throw new BadRequestException('Deletion of global sub products is not allowed');
    }
    if (subproduct) await subproduct.destroy();
  }

  async findAll(filter: ManageSubProductFilterInput, organizationId: any): Promise<ManageSubProductPaginatedResponse> {
    const {
      search, page = 1,
      limit = 10,
      productId = null,
    } = filter;
    const offset = (page - 1) * limit;
    let where: any = {
      productId: productId,
      deletedAt: null,
      [Op.or]: [
        { subProductType: 'global' },
        { subProductType: 'internal', orgId: organizationId }
      ]
    };

   if (filter.search) {
      where[Op.and] = [
        {
          [Op.or]: [
            { subProductType: 'global' },
            { subProductType: 'internal', orgId: organizationId },
          ],
        },
        { name: { [Op.like]: `%${filter.search}%` } },
      ];
    }
    
    const { rows, count } = await this.subproductModel.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    return {
      rows,
      count: rows.length,
      totalCount: count
    };
  }
}
