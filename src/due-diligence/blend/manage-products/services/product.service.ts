import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ManageProduct, ProductType } from '../entities/manage-products.entity';
import { CreateManageProductDto } from '../dto/create-manage-product.input';
import { UpdateManageProductDto } from '../dto/update-manage-product.input';
import { Op, Sequelize } from 'sequelize';
import {
  ManageProductFilterInput,
  ManageProductPaginatedResponse,
} from '../dto/manage-product-filter.input';
import { ManageSubproduct } from '../entities/manage-subproduct.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ManageProduct)
    private readonly manageProductModel: typeof ManageProduct
  ) {}

  async create(
    createManageProduct: CreateManageProductDto,
    userId: any,
    organizationId: any
  ): Promise<ManageProduct> {
    let manageProductInput: any = {
      ...createManageProduct,
      createdBy: parseInt(userId),
      orgId: parseInt(organizationId),
    };
    const product = await this.manageProductModel.create(manageProductInput);
    return product;
  }

  async update(
    id: number,
    createProductInput: UpdateManageProductDto
  ): Promise<ManageProduct> {

     const product = await this.manageProductModel.findByPk(id);

    if (!product) {
      throw new BadRequestException('Product not found');
    }

    if ((product.productType === ProductType.GLOBAL) && createProductInput.name) {
      throw new BadRequestException('Editing the name of global products is not allowed');
    }

    await this.manageProductModel.update(createProductInput, { where: { id } });
    return this.manageProductModel.findByPk(id);
  }

  async softDelete(id: number): Promise<void> {
    const product = await this.manageProductModel.findByPk(id, {
      include: [{ model: ManageSubproduct }],
    });

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.productType === 'global') {
      throw new Error('Deletion of global products is not allowed');
    }

    await product.$get('subproducts');
    if (product.subproducts) {
      for (const subproduct of product.subproducts) {
        await subproduct.destroy();
      }
    }
    await product.destroy();
  }

  async findAll(
    filter: ManageProductFilterInput,
    organizationId: number,
  ): Promise<ManageProductPaginatedResponse> {
    const {
      search = '',
      page = 1,
      limit = 10,
    } = filter;

    const offset = (page - 1) * limit;

    const where: any = {
      deletedAt: null,
      [Op.or]: [
        {
          productType: 'global'
        },
        {
          productType: 'internal', orgId: organizationId
        }
      ]
    };

    if (search) {
      where[Op.or] = [{ name: { [Op.like]: `%${search}%` } }];
    }

    let additionalQuery : any  = {};

    if(filter?.hasSubproducts) {
      additionalQuery.having = Sequelize.literal('subproductCount > 0');
    }
    
    const rows = await this.manageProductModel.findAll({
      where,
      limit,
      offset,
      attributes: {
        include: [
          [
            Sequelize.literal(`(
              SELECT COUNT(*)
              FROM manage_subproducts AS subproducts
              WHERE subproducts.productId = ManageProduct.id
                AND subproducts.deletedAt IS NULL
            )`),
            'subproductCount',
          ],
        ],
      },
      order: [['createdAt', 'DESC']],
      ...additionalQuery,
    });

    const count = await this.manageProductModel.count({ where });

    const results = rows.map((product) => {
      const productData = product.get() as ManageProduct & { subproductCount?: number };
      productData.subproductCount = (product as any).getDataValue('subproductCount');
      return productData;
    });

    return {
      rows: results,
      count: results.length,
      totalCount: count,
    };
  }

  async findOne(id: number): Promise<ManageProduct> {
    return this.manageProductModel.findByPk(id, {
      include: [{ model: ManageSubproduct }],
    });
  }
}
