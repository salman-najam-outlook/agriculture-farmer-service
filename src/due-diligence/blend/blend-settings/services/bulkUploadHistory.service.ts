import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BlendBulkUploadHistory } from '../entities/blend-bulk-upload-history.entity';
import { BulkUploadHistoryInput, BulkUploadHistoryInputPaginatedResponse } from '../dto/blend-bulk-upload-history.input';
import { Op } from 'sequelize';


@Injectable()
export class BlendBulkUploadHistoryService {
  constructor(
    @InjectModel(BlendBulkUploadHistory)
    private readonly bulkUploadHistoryModel: typeof BlendBulkUploadHistory,
  ) {}

  async findAll(filter: BulkUploadHistoryInput, organizationId: number): Promise<BulkUploadHistoryInputPaginatedResponse> {
    const {
      search,
      page = 1,
      limit = 10,
    } = filter;
    const sortBy: string = (filter.sortBy || 'createdAt').toString(); // Convert to a string primitive
    const sortOrder: string = (filter.sortOrder || 'DESC').toUpperCase(); // Ensure uppercase for valid SQL sorting

    const offset = (page - 1) * limit;
    let where = {
      orgId: organizationId,
      deletedAt: null
    };
    if (filter.search) {
      where[Op.or] = [
        { originalFileName: { [Op.like]: `%${search}%` } },
      ]
    }
    const { rows, count } = await this.bulkUploadHistoryModel.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]],
        raw: true,
    });

    return {
      rows,
      totalCount: count
    };
  }

  async create(data: Partial<BlendBulkUploadHistory>): Promise<BlendBulkUploadHistory> {
    return await this.bulkUploadHistoryModel.create(data);
  }

}
