import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { RegionalRiskAssessment } from "../entities/regional-risk-assessment.entity";
import { EnhancedRegionalRiskAssessmentResponse, RegionalRiskAssessmentFilterInput, RegionalRiskAssessmentResponse, UpdateRegionalRiskAssessmentInput } from "../dto/regional-risk-assessment.dto";
import { Op } from "sequelize";
import { RiskAssessmentCriteriaService } from "./risk-assessment-criteria.service";



@Injectable()
export class RegionalRiskAssessmentService {
  constructor(
    @InjectModel(RegionalRiskAssessment)
    private readonly regionalRiskAssessmentModel: typeof RegionalRiskAssessment,
    private readonly riskAssessmentCriteriaService: RiskAssessmentCriteriaService,
  ) {}

    async create(data: Partial<RegionalRiskAssessment>): Promise<RegionalRiskAssessment> {
      const existingRecord = await this.regionalRiskAssessmentModel.findOne({
        where: { country: data.country, deletedAt: null },
      });
      if (existingRecord) {
        throw new BadRequestException(`A record with the country '${data.country}' already exists.`);
      }

      const allowedLevels = ['Unassigned', 'Standard', 'Standard to High', 'High'];
      for (const [key, value] of Object.entries(data.riskCriteriaIdWithLevels || {})) {
        if (!allowedLevels.includes(value)) {
          throw new BadRequestException(
            `Invalid risk criteria level '${value}' for ID '${key}'. Allowed values are: ${allowedLevels.join(', ')}`,
          );
        }
      }

      return this.regionalRiskAssessmentModel.create(data);
    }

  async findAll(filter: RegionalRiskAssessmentFilterInput): Promise<RegionalRiskAssessmentResponse> {
    const {
      page = 1,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = filter;

    const offset = (page - 1) * limit;

    const whereClause = search && search.length > 0
      ? {
          country: {
            [Op.like]: `%${search}%`,
          },
        }
      : undefined;

    const { rows, count: totalCount } = await this.regionalRiskAssessmentModel.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [[sortBy, sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC']],
    });

    const riskCriteria = await this.riskAssessmentCriteriaService.findAll();
    const criteriaMap = riskCriteria.reduce((acc, item) => {
      acc[item.id] = item.description;
      return acc;
    }, {} as Record<number, string>);

    const enrichedRows = rows.map((record) => {
      const enhancedRiskCriteriaIdWithLevels = Object.entries(record.riskCriteriaIdWithLevels).map(
        ([key, value]) => ({
          id: parseInt(key),
          level: value,
          description: criteriaMap[parseInt(key)],
        }),
      );

      return {
        ...record.toJSON(),
        riskCriteriaIdWithLevels: enhancedRiskCriteriaIdWithLevels,
      };
    });

    return {
      rows: enrichedRows,
      totalCount,
      count: enrichedRows.length,
    };
  }

   async findOne(id: number): Promise<EnhancedRegionalRiskAssessmentResponse> {
    const record = await this.regionalRiskAssessmentModel.findByPk(id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    const riskCriteria = await this.riskAssessmentCriteriaService.findAll();
    const criteriaMap = riskCriteria.reduce((acc, item) => {
      acc[item.id] = item.description;
      return acc;
    }, {} as Record<number, string>);

    const enhancedRiskCriteriaIdWithLevels = Object.entries(record.riskCriteriaIdWithLevels).map(
      ([key, value]) => ({
        id: parseInt(key),
        level: value,
        description: criteriaMap[parseInt(key)],
      }),
    );

    return {
      ...record.toJSON(),
      riskCriteriaIdWithLevels: enhancedRiskCriteriaIdWithLevels,
    };
  }

  async update(data: UpdateRegionalRiskAssessmentInput): Promise<RegionalRiskAssessment> {
    const record = await this.regionalRiskAssessmentModel.findByPk(data.id);
    if (!record) {
      throw new NotFoundException('Record not found');
    }

    if (data.riskCriteriaIdWithLevels) {
      const allowedLevels = ['Unassigned', 'Standard', 'Standard to High', 'High'];
      for (const [key, value] of Object.entries(data.riskCriteriaIdWithLevels || {})) {
        if (!allowedLevels.includes(value)) {
          throw new BadRequestException(
            `Invalid risk criteria level '${value}' for ID '${key}'. Allowed values are: ${allowedLevels.join(', ')}`,
          );
        }
      }
    }

    const existingLevels = record.riskCriteriaIdWithLevels || {};
    const updatedLevels = { ...existingLevels, ...data.riskCriteriaIdWithLevels };
    data.riskCriteriaIdWithLevels = updatedLevels;

    return record.update(data);
  }

  async delete(id: number): Promise<void> {
    const record = await this.regionalRiskAssessmentModel.sequelize.query(
      `DELETE FROM regional_risk_assessment WHERE id = :id`,
      {
        replacements: { id },
        type: 'RAW',
      },
    )
    if (!record) {
      throw new NotFoundException('Record not found');
    }
  }

}