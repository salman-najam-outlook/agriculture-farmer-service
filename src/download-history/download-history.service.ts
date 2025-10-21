import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { PdfDownloadHistory } from './entities/pdf-download-history.entity';
import { PdfDownloadHistoryPaginationDTO } from './dto/pdf-download-history-pagination.dto';
import { Op } from 'sequelize';

@Injectable()
export class DownloadHistoryService {
    constructor(
        @InjectModel(PdfDownloadHistory)
        private readonly pdfDownloadHistoryModel: typeof PdfDownloadHistory
    ) {

    }

    async getHistory(paginationOptions: PdfDownloadHistoryPaginationDTO,
        orgId: number): Promise<{ rows: PdfDownloadHistory[]; count: number, totalCount: number }> {

        const { limit, page, search } = paginationOptions;
        const offset = (page - 1) * limit;

        const where: any = { orgId };
        
        if (search) {
            where[Op.or] = [
                { fileName: { [Op.like]: `%${search}%` } },
                { status: search }
            ];
        }

        const { rows, count } = await this.pdfDownloadHistoryModel.findAndCountAll({
            where,
            limit,
            offset,
            order: [["createdAt", "DESC"]],
            distinct: true,

        });

        return { rows, count: rows.length, totalCount: count };
    }

    async removeHistory(id: number): Promise<boolean>{
        const result = await this.pdfDownloadHistoryModel.destroy({
            where: {
                id
            }
        });

        return result > 0;
    }
}
