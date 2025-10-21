import { Op } from "sequelize";
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ExemptProduct } from '../entities/exempt-product.entity';
import { ExemptProductDto } from '../dto/exempt-product.input';
import { ExemptProductsFilterInput } from '../dto/filter-exempt-product.dto';
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import { ExemptProductsPaginatedResponse } from '../exempt-product.response';
import { ManageProduct } from "../../manage-products/entities/manage-products.entity";
import { ManageSubproduct } from "../../manage-products/entities/manage-subproduct.entity";
import { UpdateExemptProductDto } from "../dto/update-exempt-product.input";
import { ContainerDetailService } from "../../container-details/services/container-detail.service";
import { ContainerDetail } from "../../container-details/entities/container-detail.entity";

@Injectable()
export class ExemptProductService {
  constructor(
    @InjectModel(ExemptProduct) private readonly productModel: typeof ExemptProduct,
    private readonly containerDetailService: ContainerDetailService
  ) {}

  async create(exemptProductInput: ExemptProductDto, organizationId:number, userId: number): Promise<ExemptProduct> {
      const exemptProduct = await this.productModel.create({
        ...exemptProductInput,
        orgId: organizationId,
        createdBy: userId,
      });
  
      const inputContainerIds = [...new Set(exemptProductInput.containerIds)];
  
      if(inputContainerIds && inputContainerIds.length > 0) {
        await this.containerDetailService.attachContainersByEntity(inputContainerIds, exemptProduct, 'exemptProductId');
      }
      
      return exemptProduct;
  }

  async getExemptProducts(organizationId: number, filter?: ExemptProductsFilterInput): Promise<ExemptProductsPaginatedResponse> {
    const page = filter.page;
    let limit = filter.limit;
    const query = {
        offset: 0,
        limit: 10
    };
    if (page && limit) {
        query.offset = (page - 1) * limit;
        query.limit = limit;
    }

    let searchFilter = {};

    if (filter.searchPhrase) {
      searchFilter = {
          [Op.or]: [
              {
                internalReferenceNumber: {
                    [Op.like]: `%${filter.searchPhrase}%`
                }
              },
              {
                  id: {
                      [Op.like]: `%${filter.searchPhrase}%`
                  }
              }
          ]
      };
  }
  const response = await this.productModel.findAndCountAll({
    where: {
      ...searchFilter,
      orgId: organizationId,
      deletedAt: null
    },
    include: [
        {
            model: User,
            required: false,
            attributes: ['id', 'firstName', 'lastName', 'eori_number'],
            as: 'supplier'
        },
        {
          model: ManageProduct,
          required: false,
          attributes: ['id', 'name'],
          as: 'productDetail'
        },
        {
          model: ContainerDetail,
          required: false,
          as: 'containerIds'
      },
    ],
    offset: query.offset,
    limit: query.limit,
    order: [[filter?.sortColumn || 'id', filter?.sortOrder || 'DESC']],
    distinct: true,
  });

    return {
      totalCount: response.count,
      count: response.rows.length,
      rows: response.rows,
    };
  }

  async findOne(id) {
    const product = await this.productModel.findOne({
      where: {
        id
      },
        include: [
          {
              model: User,
              required: false,
              attributes: ['id', 'firstName', 'lastName', 'verified', 'email', 'countryId', 'mobile' ],
              as: 'supplier'
          },
          {
            model: ContainerDetail,
            required: false,
            as: 'containerIds'
          },
          {
            model: ManageProduct,
            required: false,
            attributes: ['id', 'name'],
            as: 'productDetail'
          },
          {
            model: ManageSubproduct,
            required: false,
            attributes: ['id', 'name'],
            as: 'subProductDetail'
          },
      ],
    });

    if (typeof product.countryOfActivity === 'string') {
      product.countryOfActivity = JSON.parse(product.countryOfActivity);
    }

    return product;
  }

  async update(productInput: UpdateExemptProductDto): Promise<ExemptProduct> {
    const product = await this.productModel.findByPk(productInput.id);
    if (!product) {
      throw new Error('Exempt product not found');
    }

    await this.productModel.update(productInput, { where: { id: productInput.id } });

    const inputContainerIds = [...new Set(productInput.containerIds)];

    if(inputContainerIds && inputContainerIds.length > 0) {
      await this.containerDetailService.syncContainersByEntity(inputContainerIds, product, 'exemptProductId');
    }

    return product;
  }

  async softDelete(id: number): Promise<void> {
    const product = await this.productModel.findByPk(id);
    if (product) {
      await this.containerDetailService.softDeleteByExemptProductId(product.id)
      await product.destroy();
    }
  }

  async updateAvailability(id: number, availability: boolean): Promise<void> {
    const exemptProduct = await this.productModel.findByPk(id);
    if (exemptProduct) {
      await this.productModel.update({ availability: availability?1:0 }, { where: { id: exemptProduct.id } });
    }
  }

  async findAll(orgId: number): Promise<ExemptProduct[]> {
    return this.productModel.findAll({ 
      where:{
        orgId
      },
      include: { all: true },
      order: [['id', 'DESC']]
    });
  }
}
