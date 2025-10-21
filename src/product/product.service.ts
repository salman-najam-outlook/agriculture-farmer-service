import { Inject, Injectable, HttpException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ManageProduct } from 'src/due-diligence/blend/manage-products/entities/manage-products.entity';
import { ManageSubproduct } from 'src/due-diligence/blend/manage-products/entities/manage-subproduct.entity';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ManageProduct)
    private ProductModel: typeof ManageProduct,

    @InjectModel(ManageSubproduct)
    private SubProductModel: typeof ManageSubproduct,

    @Inject('SEQUELIZE')
    private readonly sequelize: Sequelize,
  ) {}

  async findAll(orgId: number) {
    const products =  await this.ProductModel.findAll({
      where: {
        deletedAt: null,
        [Op.or]: [
          {
            productType: 'global'
          },
          {
            productType: 'internal', orgId: orgId
          }
        ]
      },
      attributes: ['id','name',],
      include: [
        {
          required: false,
          model: ManageSubproduct,
          attributes: ['id','name'],
          as: 'subproducts',
          where: {
            deletedAt: null,
            [Op.or]: [
              {
                subProductType: 'global'
              },
              {
                subProductType: 'internal', orgId: orgId
              }
            ]
          }
        }
      ]
    });
    return products;
  }

}
