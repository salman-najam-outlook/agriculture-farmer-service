import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { BlendSettings } from '../entities/blend-settings.entity';
import { CreateBlendSettingsDto } from '../dto/create-blend-settings.input';
import { BlendProductLotIdGenerator } from '../entities/blend-lot-id-configuration.entity';
import { BlendSettingProduct } from '../entities/blend-setting-product.entity';
import { Product } from 'src/product/entities/product.entity';
import { SubProduct } from 'src/product/entities/sub-product.entity';
import { UpdateBlendSettingsDto } from '../dto/update-blend-settings.dto';
import { Op } from 'sequelize';
import { BlendSettingsPaginationDto } from '../dto/blend-settings-pagination.input';
import { ManageProduct } from '../../manage-products/entities/manage-products.entity';
import { ManageSubproduct } from '../../manage-products/entities/manage-subproduct.entity';

@Injectable()
export class BlendSettingsService {
  constructor(
    @InjectModel(BlendSettings)
    private blendSettingsModel: typeof BlendSettings,
    @InjectModel(BlendSettingProduct)
    private blendSettingsProductModel: typeof BlendSettingProduct,
    private sequelize: Sequelize,
  ) {}
  
  private async generateLotId(lotIdGenerator: any, currentDate: Date): Promise<string> {
    const { typeFirst, typeSecond, separator, startCount } = lotIdGenerator;
    let newSeparator = lotIdGenerator.separator;
    if (separator === "None") {
      newSeparator = "";
    }
    if (separator === "Space") {
      newSeparator = " ";
    }
    const isTypeFirstIncremental = typeFirst === "Incremental Number";
    const isTypeSecondIncremental = typeSecond === "Incremental Number";

  if (!isTypeFirstIncremental && !isTypeSecondIncremental) {
    throw new Error("At least one type must be 'Incremental Number'.");
  }

  if (isTypeFirstIncremental && isTypeSecondIncremental) {
    throw new Error("Both types cannot be 'Incremental Number'.");
  }

    let lotIdParts: string[] = [];
    let incrementalCount = startCount ?? "0001";
    const currentYear = currentDate.getFullYear();
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    const currentDay = String(currentDate.getDate()).padStart(2, '0');

    const resetFrequency = lotIdGenerator.resetFrequency ??
      (lotIdGenerator.typeFirst === 'Year' || lotIdGenerator.typeSecond === 'Year' 
        ? 'Year' 
        : (lotIdGenerator.typeFirst === 'Month' || lotIdGenerator.typeSecond === 'Month' 
          ? 'Month' 
          : 'None')
      );

    // Helper function to handle Incremental Number generation with reset
    const getIncrementalNumber = async () => {
      const lastRecord = await BlendProductLotIdGenerator.findOne({
        order: [['createdAt', 'DESC']],
        attributes: ['lotId', 'createdAt'],
      });

      if (!lastRecord || !lastRecord.lotId) {
        return incrementalCount;
      }

      const lastCreatedDate = new Date(lastRecord.createdAt);
      const monthChanged = lastCreatedDate.getMonth() !== currentDate.getMonth();
      const yearChanged = lastCreatedDate.getFullYear() !== currentYear;

      if (
        (resetFrequency === 'Month' && monthChanged) ||
        (resetFrequency === 'Year' && yearChanged)
      ) {
        return incrementalCount; // Reset to starting count
      }

      const parts = lastRecord.lotId.split(separator || '');
      const firstPart = parseInt(parts[0], 10);
      return isNaN(firstPart) ? incrementalCount : firstPart + 1;
    };

    // Reset logic for Incremental Number if required
    if (lotIdGenerator.reset) {
      const increment = await getIncrementalNumber();
      lotIdParts.push(increment.toString().padStart(4, '0'));
    }

    // Process typeFirst to generate the lot ID
    if (typeFirst) {
      switch (typeFirst) {
        case 'Static Text':
          if (lotIdGenerator.staticText) {
            lotIdParts.push(lotIdGenerator.staticText);
          } else {
            throw new Error("Static Text type requires a 'staticText' value in the input.");
          }
          break;

        case 'Incremental Number':
          const incrementFirst = await getIncrementalNumber();
          lotIdParts.push(incrementFirst.toString().padStart(4, '0'));
          break;

        case 'Year':
          lotIdParts.push(currentYear.toString());
          break;

        case 'Month':
          lotIdParts.push(currentMonth);
          break;

        case 'Date':
          lotIdParts.push(currentDay);
          break;

        default:
          throw new Error(`Unsupported type for typeFirst: ${lotIdGenerator.typeFirst}`);
      }
    }

    // Process typeSecond to generate the lot ID
    if (lotIdGenerator.typeSecond) {
      switch (lotIdGenerator.typeSecond) {
        case 'Static Text':
          if (lotIdGenerator.staticText) {
            lotIdParts.push(lotIdGenerator.staticText);
          } else {
            throw new Error("Static Text type requires a 'staticText' value in the input.");
          }
          break;

        case 'Incremental Number':
          const incrementSecond = await getIncrementalNumber();
          lotIdParts.push(incrementSecond.toString().padStart(4, '0'));
          break;

        case 'Year':
          lotIdParts.push(currentYear.toString());
          break;

        case 'Month':
          lotIdParts.push(currentMonth);
          break;

        case 'Date':
          lotIdParts.push(currentDay);
          break;

        default:
          throw new Error(`Unsupported type for typeSecond: ${lotIdGenerator.typeSecond}`);
      }
    }

    let lotId = '';
    if (lotIdGenerator.typeFirst && lotIdGenerator.typeSecond) {
      // Join typeFirst and typeSecond with the separator
      lotId = lotIdParts[0] + newSeparator+ lotIdParts[1];
    } else {
      // If either typeFirst or typeSecond is not provided, just join the parts
      lotId = lotIdParts.join(newSeparator || '-');
    }

    // Join the lotId parts with the separator
    return lotId
  }

  async findOne(id: number): Promise<BlendSettings> {
    return this.blendSettingsModel.findByPk(id, {
      include: [
        BlendProductLotIdGenerator,
        { model: BlendSettingProduct, include: [ManageProduct, ManageSubproduct] },
      ],
    });
  }

  async findAll(paginationOptions: BlendSettingsPaginationDto, orgId: number): Promise<{ rows: BlendSettings[]; count: number,  }> {
    const { limit, sortBy, order, blendTitle, blendCode, page } = paginationOptions;
    const offset = (page - 1) * limit;

    const result = await this.blendSettingsModel.findAndCountAll({
      where: {
        ...(blendTitle && { blend_title: { [Op.like]: `%${blendTitle}%` } }),
        ...(blendCode && { blend_code: { [Op.like]: `%${blendCode}%` } }),
        orgId
      },
      limit,
      offset,
      order: [[sortBy || 'createdAt', order || 'DESC']],
      include: [
        BlendProductLotIdGenerator,
        { model: BlendSettingProduct, include: [ManageProduct, ManageSubproduct] },
      ],
      distinct: true,
    });    

    return { rows: result.rows, count: result.count,  };
  }

  async findAllByProductAndSubProduct(
    paginationOptions: BlendSettingsPaginationDto,
    orgId: number
  ): Promise<{ rows: BlendSettings[]; count: number }> {
    const { limit, sortBy, order, blendTitle, blendCode, page } = paginationOptions;
    const offset = (page - 1) * limit;

    const result = await this.blendSettingsModel.findAndCountAll({
      where: {
        ...(blendTitle && { blend_title: { [Op.like]: `%${blendTitle}%` } }),
        ...(blendCode && { blend_code: { [Op.like]: `%${blendCode}%` } }),
        orgId,
      },
      limit,
      offset,
      order: [[sortBy || 'createdAt', order || 'DESC']],
      include: [
        {
          model: BlendSettingProduct,
          where: {
            productId: { [Op.ne]: null },
            subProductId: { [Op.ne]: null },
          },
          include: [ManageProduct, ManageSubproduct],
        }, {
          model:BlendProductLotIdGenerator
        }
      ],
    });

    return { rows: result.rows, count: result.rows.length };
  }

  async bulkCreate(blendSettingsData: Partial<BlendSettings>[]): Promise<BlendSettings[]> {
    const transaction = await this.sequelize.transaction();

    try {
      const createdBlendSettings = await BlendSettings.bulkCreate(blendSettingsData, { transaction });

      await transaction.commit();
      return createdBlendSettings;
    } catch (error) {
      await transaction.rollback();
      throw new Error(error.message || 'Bulk creation failed');
    }
  }


  async create(input: CreateBlendSettingsDto, orgId: number): Promise<BlendSettings> {
    const { blendCode, finalProductCode, lotIdGenerator, blendProducts, ...blendSettingsData } = input;
    const currentDate = new Date();
    try {

      const [existingBlendCode, existingFinalProductCode] = await Promise.all([
        this.blendSettingsModel.findOne({
          where: {
            orgId,
            blendCode
          }
        }),
        this.blendSettingsModel.findOne({
          where: {
            orgId,
            finalProductCode
          }
        })
      ]);

      const errors = [];

      if (existingBlendCode) {
        errors.push('The blend code already exists.');
      }
      
      if (existingFinalProductCode) {
        errors.push('The final product code already exists.');
      }
      
      if (errors.length > 0) {
        throw new Error(errors.join(' ')); 
      }

      const lotId = await this.generateLotId(lotIdGenerator, currentDate);

      const blendSettingsInstance = await this.blendSettingsModel.create(
        {...blendSettingsData, blendCode, finalProductCode, orgId} as Partial<BlendSettings>,
      );
      const blendSettings = blendSettingsInstance.get({ plain: true });

      if (lotIdGenerator) {
        await BlendProductLotIdGenerator.create({
          ...lotIdGenerator,
          lotId,
          blendSettingsId: blendSettings.id,
        });
      }

      if (blendProducts && blendProducts.length) {
        const products = blendProducts.map(product => ({ ...product, blendSettingsId: blendSettings.id }));
        await BlendSettingProduct.bulkCreate(products);
      }
      return this.findOne(blendSettings.id);
    } catch (error) {
      throw new Error(error)
    }
  }

  async update(id: number, input: UpdateBlendSettingsDto, orgId: number): Promise<BlendSettings> {
    const { blendProducts, blendCode, finalProductCode, lotIdGenerator, ...blendSettingsData } = input;
    try {
      const [existingBlendCode, existingFinalProductCode] = await Promise.all([
        this.blendSettingsModel.findOne({
          where: {
            orgId,
            blendCode,
            id: { [Op.ne]: id } 
          }
        }),
        this.blendSettingsModel.findOne({
          where: {
            orgId,
            finalProductCode,
            id: { [Op.ne]: id }
          }
        })
      ]);

      const errors = [];

      if (existingBlendCode) {
        errors.push('The blend code already exists.');
      }

      if (existingFinalProductCode) {
        errors.push('The final product code already exists.');
      }

      if (errors.length > 0) {
        throw new Error(errors.join(' ')); 
      }

      const blendSettingsInstance = await this.blendSettingsModel.findByPk(id);
      if (!blendSettingsInstance) throw new Error('BlendSettings not found');

      await blendSettingsInstance.update({...blendSettingsData, blendCode, finalProductCode} as any);

      if (lotIdGenerator) {
        const lotId = await this.generateLotId(lotIdGenerator, new Date());

        const existingRecord = await BlendProductLotIdGenerator.findOne({
          where: { blendSettingsId: id },
        }); 
      
        if (existingRecord) {
          await BlendProductLotIdGenerator.update(
            { 
              lotId,
              ...lotIdGenerator,
             },
            { where: { blendSettingsId: id } }
          );
        } else {
          await BlendProductLotIdGenerator.create({
            ...lotIdGenerator,
            lotId,
            blendSettingsId: blendSettingsInstance.id,
          });
        }
      }

      if (blendProducts && blendProducts.length) {

        await BlendSettingProduct.destroy({
          where: { blendSettingsId: id },
        });

        await BlendSettingProduct.bulkCreate(blendProducts.map(product => ({
          ...product,
          blendSettingsId: id
        })));
      }
      return this.findOne(id);
    } catch (error) {
      throw new Error(error)
    }
  }


  async delete(id: number): Promise<boolean> {
    const transaction = await this.sequelize.transaction();
  
    try {
      // Find the existing BlendSettings instance
      const blendSettingsInstance = await this.blendSettingsModel.findByPk(id);
      if (!blendSettingsInstance) {
        throw new Error('BlendSettings not found');
      }
  
      // Delete associated BlendSettingProduct entries
      await BlendSettingProduct.destroy({
        where: { blendSettingsId: id },
        transaction,
      });
  
      // Delete associated BlendProductLotIdGenerator entries
      await BlendProductLotIdGenerator.destroy({
        where: { blendSettingsId: id },
        transaction,
      });
  
      // Delete the BlendSettings instance
      await blendSettingsInstance.destroy({ transaction });
  
      // Commit the transaction if everything was successful
      await transaction.commit();
      return true;
    } catch (error) {
      // Rollback the transaction if any operation fails
      await transaction.rollback();
      throw error;
    }
  }
  
  async findAllResponse(orgId:number):Promise<BlendSettings[]>{
    return this.blendSettingsModel.findAll({
      where:{
        orgId
      },
      include: { all: true },
      order: [['id', 'DESC']]
    });
    
  }
  
}