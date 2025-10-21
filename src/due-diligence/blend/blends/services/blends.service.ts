import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';

import { Blend } from '../entities/blend.entity';
import { BlendProduct } from '../entities/blend-product.entity';
import { CreateBlendInput, DdrMetricsDto } from '../dto/create-blend.input';
import { Op, QueryTypes } from 'sequelize';
import { BlendListFilterInput } from '../dto/blend-response.dto';
import { ContainerDetailService } from '../../container-details/services/container-detail.service';
import { BlendSettings } from '../../blend-settings/entities/blend-settings.entity';
import { ContainerDetail } from '../../container-details/entities/container-detail.entity';
import { BlendProductFilter } from '../dto/blend-product.filter';
import { ExemptProduct } from '../../exempt-products/entities/exempt-product.entity';
import { ManageProduct } from '../../manage-products/entities/manage-products.entity';
import { ManageSubproduct } from '../../manage-products/entities/manage-subproduct.entity';
import { UpdateBlendInput } from '../dto/update-blend.dto';
import { Sequelize } from 'sequelize-typescript';
import { BlendProductsResponse } from '../dto/blend-products-response.dto';
import { BlendProductDto } from '../dto/blend-product.dto';
import { DueDiligenceProductionPlace } from 'src/due-diligence/production-place/entities/production-place.entity';
import { HideDdsReport } from '../entities/hide-dds-report';
import { DiligenceReport } from 'src/diligence-report/entities/diligence-report.entity';
import { Farm } from 'src/farms/entities/farm.entity';
import { DiligenceReportAssessment } from 'src/diligence-report/entities/diligence-report-assessment.entity';
import { FarmCoordinates } from 'src/farms/entities/farmCoordinates.entity';
import { FarmPointCoordinatesInput } from 'src/due-diligence/production-place/dto/create-production-place.input';
import { AssessmentProductionPlace } from 'src/assessment-builder/entities/assessment-production-place.entity';
import { UserDDS } from 'src/users/entities/dds_user.entity';

@Injectable()
export class BlendService {

  
  constructor(
    @InjectModel(Blend) private readonly blendModel: typeof Blend,
    @InjectModel(BlendProduct) private readonly blendProductModel: typeof BlendProduct,
    @InjectModel(DiligenceReport) private diligenceReportModel: typeof DiligenceReport,
    @InjectModel(ExemptProduct) private exemptProductModel: typeof ExemptProduct,
    @InjectModel(DueDiligenceProductionPlace) private dueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
    @InjectModel(HideDdsReport) private hideDdsReportModel: typeof HideDdsReport,
    @InjectModel(ContainerDetail) private containerDetailModel: typeof ContainerDetail,

    private readonly containerDetailService: ContainerDetailService,
    private sequelize: Sequelize,
  ) {}

  async createBlend(createBlendInput: CreateBlendInput, userId: Number, orgId:Number): Promise<Blend> {
    const { blendProducts, hideBlendDdsProductIds, containerIds, companyId, ...blendData } = createBlendInput;
    try {
      let blendDataInput: any = {
        ...blendData,
        userId: parseInt(userId.toString()),
      };

     
        blendDataInput = {
          ...blendDataInput,
          companyId: orgId,
        };
      

      const blend = await this.blendModel.create(blendDataInput as unknown as Partial<Blend>);
      if (containerIds && containerIds.length > 0) {
        await this.containerDetailService.attachContainersByEntity(
          [...new Set(containerIds)],
          blend,
          'blendId',
        );
      }

      if(hideBlendDdsProductIds && hideBlendDdsProductIds.length > 0) {
        await this.hideDdsReportModel.bulkCreate(
          hideBlendDdsProductIds.map((ddrId) => ({ ddrId, blendId: blend.id })),
        );
      }

      if (blendProducts && blendProducts.length > 0) {
        const products = blendProducts.map((product) => ({
          ...product,
          blendId: blend.id,
        }));
        await this.blendProductModel.bulkCreate(products);
      }

      return this.findOne(blend.id);
    } catch (error) {
      throw error;
    }
  }
  

  async findOne(id: number): Promise<Blend> {
    return this.blendModel.findOne({
      where: { id },
      include: [
        {
          model: ContainerDetail,
          as: 'containerIds',
        },
        {
          model: BlendProduct,
          include: [
            {
              model: ManageProduct,
              as: 'product', 
              
            },
            {
              model: ManageSubproduct,
              as: 'subProduct',
              
            },
          ],
        },
      ],
    });
  }
  

  async listAllBlends(orgId: number, filter: BlendListFilterInput): Promise<any> {
   const {
     search = '',
     searchByCountry='',
     blendStatus,
      page = 1,
      limit = 10,
    } = filter;

    const offset = (page - 1) * limit;

    const blends = await this.blendModel.findAndCountAll({
        where: {
          orgId: orgId,
          ...(search && {
            [Op.or]: [
              { name: { [Op.like]: `%${search}%` } },
              { blendLotId: { [Op.like]: `%${search}%` } },
            ],
          }),
          ...(Array.isArray(searchByCountry) && searchByCountry.length > 0 && {
            [Op.and]: Sequelize.literal(
              `(${searchByCountry
                .map((country) => `JSON_CONTAINS(country_of_entry, '"${country}"')`)
                .join(' OR ')})`
            ),
        }),
        ...(blendStatus && { blendStatus }),
        },
      attributes: [
        'id',
        'name',
        'blendLotId',
        'internalReferenceNumber',
        'countryOfEntry',
        'eudrReferenceNumber',
        'blendStatus',
        'createdAt'
      ],
      limit,
      offset,
      distinct: true,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: BlendProduct,
          as: 'blendProducts',
          required: false, 
        },
      ],
    });
    const numberOfIngredients = await this.blendProductModel.findAll({
      attributes: [
        'blendId',
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn(
              'DISTINCT',
              Sequelize.literal("CONCAT(product_id, '-', sub_product_id)")
            )
          ),
          'uniqueProductCount',
        ],
      ],
      group: ['blendId'],
      raw: true,
    });

    const ingredientCountMap = (numberOfIngredients as any[]).reduce(
      (acc, curr) => {
        acc[curr.blendId] = parseInt(curr.uniqueProductCount, 10);
        return acc;
      },
      {} as Record<number, number>
    );
    
    const response = await Promise.all(
      blends.rows.map(async (blend) => {
        let totalNetMass = 0;
        let totalVolume = 0;
        let totalFarmCount = 0;

        const productsDetails = await Promise.all(
          blend.blendProducts.map(async (product) => {
            if (product.exemptProductId) {
              const exemptProduct = await this.exemptProductModel.findOne({
                where: { id: product.exemptProductId },
                attributes: ['internalReferenceNumber', 'productNetMass', 'productVolume'],
              });

              if (exemptProduct) {
                const netMass = parseFloat(exemptProduct.productNetMass || '0');
                const volume = parseFloat(exemptProduct.productVolume || '0');
                totalNetMass += isNaN(netMass) ? 0 : netMass;
                totalVolume += isNaN(volume) ? 0 : volume;

                return {
                  productType: 'ExemptProduct',
                  referenceNumber: exemptProduct.internalReferenceNumber,
                  netMass: isNaN(netMass) ? 0 : netMass,
                  volume: isNaN(volume) ? 0 : volume,
                };
              }
            }

            if (product.ddrId) {
              const diligenceReport = await this.diligenceReportModel.findOne({
                where: { id: product.ddrId },
                attributes: ['EUDRReferenceNumber', 'internalReferenceNumber', 'productNetMass', 'productVolume'],
              });

              if (diligenceReport) {
                const netMass = parseFloat(diligenceReport.productNetMass || '0');
                const volume = parseFloat(diligenceReport.productVolume || '0');
                totalNetMass += isNaN(netMass) ? 0 : netMass;
                totalVolume += isNaN(volume) ? 0 : volume;

                const farmCount = await this.dueDiligenceProductionPlaceModel.count({
                  where: { dueDiligenceReportId: product.ddrId },
                });

                totalFarmCount += farmCount;

                return {
                  productType: 'DiligenceReport',
                  referenceNumber: diligenceReport.internalReferenceNumber,
                  EUDRReferenceNumber: diligenceReport.EUDRReferenceNumber,
                  netMass: isNaN(netMass) ? 0 : netMass,
                  volume: isNaN(volume) ? 0 : volume,
                  farmCount,
                };
              }
            }

            return null;
          })
        );

        return {
          id: blend.id,
          name: blend.name,
          blendLotId: blend.blendLotId,
          internalReferenceNumber: blend.internalReferenceNumber,
          countryOfEntry: blend.countryOfEntry,
          eudrReferenceNumber: blend.eudrReferenceNumber || null,
          totalNetMass: isNaN(totalNetMass) ? 0 : totalNetMass,
          totalVolume: isNaN(totalVolume) ? 0 : totalVolume,
          totalFarmCount,
          numberOfIngredients: ingredientCountMap[blend.id] || 0,
          products: productsDetails.filter(Boolean),
          blendStatus: blend.blendStatus
        };
      })
    );

    return {
      totalCount: blends.count,
      count: response.length,
      rows: response,
    };
  }

  async updateBlend(id: number, input: UpdateBlendInput, orgId): Promise<Blend> {
    const {
      containerIds,
      blendProducts,
      companyId,
      ...blendData
    } = input;
  
   
    try {
      // Find the existing blend
      const blend = await this.blendModel.findByPk(id);
      if (!blend) {
        throw new Error(`Blend with ID ${id} not found.`);
      }
  
      // Update blend details
      await blend.update(blendData);

      // update comaany id with org id
      await blend.update({companyId: orgId});

      // Update container associations
      if (containerIds) {
        await this.containerDetailService.attachContainersByEntity(
          [...new Set(containerIds)],
          blend,
          'blendId',
        );
      }
  
      // Update blend products
      if (blendProducts && blendProducts.length > 0) {
        for (const product of blendProducts) {
          if (product.id) {
            // Update existing blend product
            const existingProduct = await this.blendProductModel.findByPk(product.id);
            if (existingProduct) {
              await existingProduct.update(product);
            } else {
              throw new Error(`BlendProduct with ID ${product.id} not found.`);
            }
          } else {
            // Create a new blend product
            await this.blendProductModel.create(
              {
                ...product,
                blendId: id,
              }
            );
          }
        }
      }
  
      // Return the updated blend along with its associated products
      return this.findOne(id);
    } catch (error) {
      throw error;
    }
  }
  
  
  

  async findBlendReport(id: number) : Promise<Blend> {
    return this.blendModel.findOne({
      where: { id },
      include: [
        BlendSettings,
        ContainerDetail,
        UserDDS,
        {
          model: BlendProduct,
          include: [
            {
              model: ManageProduct,
              as: 'product',
              attributes: ['id','name'],
            },
            {
              model: ManageSubproduct,
              as: 'subProduct',
              attributes: ['id','name'],
            },
            {
              model: ExemptProduct,
              as: 'exemptProduct',
              include: [
                {
                  model: ManageProduct,
                  as: 'productDetail',
                  attributes: ['id','name'],
                },
                {
                  model: ContainerDetail,
                  as: 'containerIds',
                  attributes: ['id','containerId'],
                },
              ]
            },
            {
              model: DiligenceReport,
              as: 'ddr',
              include: [
                {
                  model: ManageProduct,
                  as: 'product_detail',
                  attributes: ['name'],
                },
              ]
            },
          ],
        },
      ], 
    });
  }

  async blendProducts(organizationId: number, filter: BlendProductFilter): Promise<BlendProductsResponse> {

    const { page = 1, limit = 10,  } = filter;
    const offset = (page - 1) * limit;

    if(filter?.blendId) {
      const hideDds = await this.hideDdsReportModel.findAll({where: {blendId: filter?.blendId}});      
      filter.hideBlendDdsProductIds = hideDds.map((hideDds) => String(hideDds.ddrId));
    }

     
   const products = await this.fetchDataUsingQuery(
      `SELECT * FROM (${this.queryDiligenceReportsAndExemptProducts(filter)}) AS combined_result
       WHERE productType IN ('dds', 'exempt')
       ${filter?.containerId? 'AND containerId LIKE :containerId':''}
       ${filter?.internalReferenceNumber? 'AND internalReferenceNumber LIKE :internalReferenceNumber':''}
       ${filter?.country? 'AND countryOfActivity LIKE :countryOfActivity':''}
       ORDER BY createdAt ASC
       LIMIT :itemsPerPage OFFSET :offset
    `,
      {
        ...filter, 
        organizationId, 
        containerId: `%${filter?.containerId}%`,
        internalReferenceNumber: `%${filter?.internalReferenceNumber}%`,
        countryOfActivity: `%${filter?.country}%`,
        itemsPerPage: limit,
        offset: offset,
      },
    );

    const [productsCount] = await this.fetchDataUsingQuery(
      `SELECT COUNT(*) AS totalCount FROM (${this.queryDiligenceReportsAndExemptProducts(filter)}) AS combined_result
        WHERE productType IN ('dds', 'exempt')
       ${filter?.containerId? 'AND containerId LIKE :containerId':''}
       ${filter?.internalReferenceNumber? 'AND internalReferenceNumber LIKE :internalReferenceNumber':''}
       ${filter?.country? 'AND countryOfActivity LIKE :countryOfActivity':''}
      `,
      {
        ...filter,
        organizationId,
        containerId: `%${filter?.containerId}%`,
        internalReferenceNumber: `%${filter?.internalReferenceNumber}%`,
        countryOfActivity: `%${filter?.country}%`,
      }
    ) as { totalCount: number }[];
    
    return {
      totalCount: productsCount.totalCount,
      count: products.length,
      rows: products as BlendProductDto[],
    };
  }


  async fetchDataUsingQuery(query, filter) {
    return await this.sequelize.query(query, {
      replacements: {
        ...filter,
      },
      type: QueryTypes.SELECT
    })
  }


  queryDiligenceReportsAndExemptProducts(filter) {
    const productionPlaceCount = 
    `(SELECT COUNT(p.id) FROM diligence_reports_due_diligence_production_places AS p
        INNER JOIN user_farms uf
            ON uf.id = p.farmId AND uf.isDeleted = 0
        INNER JOIN users_dds ud
            ON ud.id = uf.userDdsId
        WHERE
            p.diligenceReportId = diligence_reports.id
            AND p.removed = 0) as productionPlaceCount
    `;

    const cotainerId = `
      (SELECT containerId 
      FROM container_details 
      WHERE container_details.exemptProductId = exempt_products.id 
      ORDER BY containerId ASC LIMIT 1) AS containerId
    `;

    return `
      SELECT 
        diligence_reports.id, 
        diligence_reports.internalReferenceNumber,
        diligence_reports.productNetMass,
        diligence_reports.countryOfActivity,
        manage_products.name as productName,
        'dds' AS productType,
        diligence_reports.containerIds AS containerId,
        diligence_reports.status,
        diligence_reports.EUDRReferenceNumber,
        diligence_reports.createdAt,
        ${productionPlaceCount}
      FROM diligence_reports 
      INNER JOIN manage_products ON manage_products.id = diligence_reports.product
      WHERE diligence_reports.product = :productId
      AND diligence_reports.subProduct = :subProductId
      AND diligence_reports.organizationId = :organizationId
      AND diligence_reports.status IN ('Compliant', 'Non-Compliant')
      ${filter?.hideBlendDdsProductIds && filter?.hideBlendDdsProductIds.length > 0?'AND diligence_reports.id NOT IN (:hideBlendDdsProductIds)':''}
      ${filter?.createdAt? 'AND DATE(diligence_reports.createdAt) = :createdAt':''}      
      AND diligence_reports.isDeleted = 0
      UNION ALL
      SELECT 
        exempt_products.id,
        exempt_products.internalReferenceNumber,
        exempt_products.productNetMass,
        exempt_products.countryOfActivity,
        manage_products.name as productName,
        'exempt' AS productType,
        ${cotainerId},
        'exempt' AS status,
        NULL AS EUDRReferenceNumber,
        exempt_products.createdAt,
        NULL AS productionPlaceCount
      FROM exempt_products 
      INNER JOIN manage_products ON manage_products.id = exempt_products.product
      WHERE exempt_products.product = :productId
      AND exempt_products.subProduct = :subProductId
      AND exempt_products.orgId = :organizationId
      AND exempt_products.availability = 1
      ${filter?.createdAt? 'AND DATE(exempt_products.createdAt) = :createdAt':''}
      AND exempt_products.deletedAt IS NULL
    `;
  }

async copyAndCreate(blendId: number): Promise<Blend> {
  const transaction = await this.sequelize.transaction();

  try {
    const blendData = await this.findOne(blendId);
    if (!blendData) {
      throw new Error(`Blend with ID ${blendId} not found.`);
    }

    const plainBlend = blendData.get({ plain: true });
    const { id, blendProducts, containerDetails, ...blendDetails } = plainBlend;
    const newBlend = await this.blendModel.create(
      { ...blendDetails },
      { transaction }
    );
    if (blendProducts && blendProducts.length > 0) {
      const newProducts = blendProducts.map((product) => ({
        ...product,
        id: undefined, 
        blendId: newBlend.id, 
      }));

      await this.blendProductModel.bulkCreate(newProducts, { transaction });
    }

    if (containerDetails && containerDetails.length > 0) {
      const containerIds = containerDetails.map((container) => container.id);
      await this.containerDetailService.attachContainersByEntity(
        containerIds,
        newBlend,
        'blendId'
      );
    }
    await transaction.commit();

    return this.findOne(newBlend.id);
  } catch (error) {
    // Rollback the transaction on error
    await transaction.rollback();
    throw error;
  }
}

  async deleteBlend(blendId: number): Promise<{ success: boolean; message: string }> {
    const transaction = await this.sequelize.transaction();

    try {
      // Step 1: Fetch the blend with associated data
      const blendData = await this.findOne(blendId);
      if (!blendData) {
        throw new Error(`Blend with ID ${blendId} not found.`);
      }

      const plainBlend = blendData.get({ plain: true });
      const { blendProducts, containerIds } = plainBlend;

      // Step 2: Delete associated blend products
      if (blendProducts && blendProducts.length > 0) {
        const blendProductIds = blendProducts.map((product) => product.id);
        await this.blendProductModel.destroy({
          where: { id: { [Op.in]: blendProductIds } },
          force: true,
          transaction,
        });
      }

      // Step 3: Delete associated container details
      if (containerIds && containerIds.length > 0) {
        const containerIdsArray = containerIds.map((container) => container.id);

        // Permanently delete related container details
        await this.containerDetailModel.destroy({
          where: { id: { [Op.in]: containerIdsArray } },
          force: true,
          transaction,
        });
      }

      
      await this.blendModel.destroy({
        where: { id: blendId },
        transaction,
        force: true,
      });

    
      await transaction.commit();

      return { success: true, message: 'Blend and all related data were successfully deleted.' };
    } catch (error) {
      
      await transaction.rollback();
      throw new Error(`Failed to delete blend: ${error.message}`);
    }
  }

  async hideDdsReportFromBlendProducts(blendId: number, ddrId: number): Promise<void> {
    const hideDdsReport = await HideDdsReport.findOne({
      where: {blendId, ddrId}
    })
    if(!hideDdsReport) {
      await HideDdsReport.create({blendId, ddrId});
    }
  }

  async findReportDdrId(ddrIds: number[]): Promise<any> {
    const reports = await this.diligenceReportModel.findAll({
        where: {
            id: ddrIds,
            isDeleted: 0,
        },
        include: [
            {
                model: DiligenceReportAssessment,
                as: "diligenceReportAssessment",
                required: false,
            },
        ],
    });

    const totalRiskAssessments = reports.reduce(
        (count, report) => count + (report.diligenceReportAssessment?.length || 0),
        0
    );

    const aggregatedMetrics = await this.sequelize.query(
        `
        SELECT
            SUM(DISTINCT uf.area) AS totalArea,
            SUM(DISTINCT CASE WHEN ddpp.eudr_deforestation_status LIKE "High%" THEN uf.area ELSE 0 END) AS totalAreaOfHighRiskFarms,
            SUM(DISTINCT CASE WHEN ddpp.eudr_deforestation_status LIKE "Zero/Negligible%" OR ddpp.eudr_deforestation_status LIKE "Low%" THEN uf.area ELSE 0 END) AS totalAreaOfZeroRiskFarms,
            COUNT(DISTINCT(uf.id)) AS totalProductionPlaces,
            COUNT(DISTINCT(CASE WHEN ddpp.eudr_deforestation_status IS NOT NULL THEN ddpp.id ELSE NULL END)) AS totalDeforestationAssessments,
            COUNT(DISTINCT(CASE WHEN ddpp.eudr_deforestation_status LIKE "High%" OR ddpp.eudr_deforestation_status LIKE "Very High%" THEN ddpp.id ELSE NULL END)) AS totalHighDeforestationProductionPlaces,
            COUNT(DISTINCT(CASE WHEN ddpp.eudr_deforestation_status LIKE "Zero/Negligible%" OR ddpp.eudr_deforestation_status LIKE "Low%" THEN ddpp.id ELSE NULL END)) AS totalLowAndZeroRiskFarms,
            COUNT(DISTINCT(CASE WHEN g.geofenceRadius IS NOT NULL THEN uf.id ELSE NULL END)) AS pointProductionPlaces,
            COUNT(DISTINCT(CASE WHEN g.geofenceRadius IS NULL THEN uf.id ELSE NULL END)) AS polygonProductionPlaces
        FROM
            due_diligence_production_places ddpp
        INNER JOIN user_farms uf
            ON uf.id = ddpp.farmId
            AND uf.isDeleted = false
        INNER JOIN geofences g
            ON g.farmId = uf.id
            AND g.isPrimary = true
            AND g.is_deleted = false
        WHERE
            ddpp.removed = false
            AND ddpp.dueDiligenceReportId IN (:reportIds);
        `,
        {
            replacements: { reportIds: ddrIds },
            plain: true,
        }
    );

    const {
        totalArea,
        totalAreaOfHighRiskFarms,
        totalAreaOfZeroRiskFarms,
        totalProductionPlaces,
        totalDeforestationAssessments,
        totalHighDeforestationProductionPlaces,
        totalLowAndZeroRiskFarms,
        pointProductionPlaces,
        polygonProductionPlaces,
    } = aggregatedMetrics;

    const result = {
        totalDDSReports: ddrIds.length,
        totalPolygonProductionPlaces: Number(polygonProductionPlaces),
        totalPointProductionPlaces: Number(pointProductionPlaces),
        totalDeforestationAssessments: Number(totalDeforestationAssessments),
        totalRiskAssessments,
        totalFarmCount: Number(totalProductionPlaces),
        totalHighDeforestationProductionPlaces: Number(totalHighDeforestationProductionPlaces),
        totalLowAndZeroRiskFarms: Number(totalLowAndZeroRiskFarms),
        totalArea: (Number(totalArea)* 0.404686).toFixed(6),
        finalAverageGeofenceArea: ((Number(totalArea)* 0.404686)/Number(totalProductionPlaces)).toFixed(6),
        totalAreaHighRiskFarms: (Number(totalAreaOfHighRiskFarms)* 0.404686).toFixed(6),
        totalAreaLowAndZeroRiskFarms: (Number(totalAreaOfZeroRiskFarms)* 0.404686).toFixed(6),
    };
    return result
  }

  async listAllBlendsByOrgId(orgId: number): Promise<any> {
    // Fetch all blends for the given organization ID
    const blends = await this.blendModel.findAll({
      where: { orgId },
      attributes: [
        'id',
        'name',
        'blendLotId',
        'internalReferenceNumber',
        'countryOfEntry',
        'eudrReferenceNumber',
        'createdAt',
        'blendStatus'
      ],
      include: [
        {
          model: BlendProduct,
          as: 'blendProducts',
        },
      ],
      order: [['createdAt', 'DESC']],
    });
    const numberOfIngredients = await this.blendProductModel.findAll({
      attributes: [
        'blendId',
        [
          Sequelize.fn(
            'COUNT',
            Sequelize.fn(
              'DISTINCT',
              Sequelize.literal("CONCAT(product_id, '-', sub_product_id)")
            )
          ),
          'uniqueProductCount',
        ],
      ],
      group: ['blendId'],
      raw: true,
    });

    const ingredientCountMap = (numberOfIngredients as any[]).reduce(
      (acc, curr) => {
        acc[curr.blendId] = parseInt(curr.uniqueProductCount, 10);
        return acc;
      },
      {} as Record<number, number>
    );
    
    // Map through the blends and include aggregated data if needed
    const response = await Promise.all(
      blends.map(async (blend) => {
        let totalNetMass = 0;
        let totalVolume = 0;
        let totalFarmCount = 0;
  
        const productsDetails = await Promise.all(
          blend.blendProducts.map(async (product) => {
            if (product.exemptProductId) {
              const exemptProduct = await this.exemptProductModel.findOne({
                where: { id: product.exemptProductId },
                attributes: ['internalReferenceNumber', 'productNetMass', 'productVolume'],
              });
  
              if (exemptProduct) {
                const netMass = parseFloat(exemptProduct.productNetMass || '0');
                const volume = parseFloat(exemptProduct.productVolume || '0');
                totalNetMass += isNaN(netMass) ? 0 : netMass;
                totalVolume += isNaN(volume) ? 0 : volume;
  
                return {
                  productType: 'ExemptProduct',
                  referenceNumber: exemptProduct.internalReferenceNumber,
                  netMass: isNaN(netMass) ? 0 : netMass,
                  volume: isNaN(volume) ? 0 : volume,
                };
              }
            }
  
            if (product.ddrId) {
              const diligenceReport = await this.diligenceReportModel.findOne({
                where: { id: product.ddrId },
                attributes: ['EUDRReferenceNumber', 'internalReferenceNumber', 'productNetMass', 'productVolume'],
              });
  
              if (diligenceReport) {
                const netMass = parseFloat(diligenceReport.productNetMass || '0');
                const volume = parseFloat(diligenceReport.productVolume || '0');
                totalNetMass += isNaN(netMass) ? 0 : netMass;
                totalVolume += isNaN(volume) ? 0 : volume;
  
                const farmCount = await this.dueDiligenceProductionPlaceModel.count({
                  where: { dueDiligenceReportId: product.ddrId },
                });
  
                totalFarmCount += farmCount;
  
                return {
                  productType: 'DiligenceReport',
                  referenceNumber: diligenceReport.internalReferenceNumber,
                  EUDRReferenceNumber: diligenceReport.EUDRReferenceNumber,
                  netMass: isNaN(netMass) ? 0 : netMass,
                  volume: isNaN(volume) ? 0 : volume,
                  farmCount,
                };
              }
            }
  
            return null;
          })
        );
  
        return {
          id: blend.id,
          name: blend.name,
          blendLotId: blend.blendLotId,
          internalReferenceNumber: blend.internalReferenceNumber,
          countryOfEntry: blend.countryOfEntry,
          eudrReferenceNumber: blend.eudrReferenceNumber || null,
          totalNetMass: isNaN(totalNetMass) ? 0 : totalNetMass,
          totalVolume: isNaN(totalVolume) ? 0 : totalVolume,
          totalFarmCount,
          numberOfIngredients: ingredientCountMap[blend.id] || 0,
          products: productsDetails.filter(Boolean),
          blendStatus: blend.blendStatus
        };
      })
    );
  
    return response;
  }
  
}
