import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { DownloadHistoryService } from './download-history.service';
import { PdfDownloadHistory } from './entities/pdf-download-history.entity';
import { PdfDownloadHistoryResult, PdfDownloadHistoryPaginationDTO } from './dto/pdf-download-history-pagination.dto';
import { GetTokenData } from 'src/decorators/get-token-data.decorator';

@Resolver()
export class DownloadHistoryResolver {
    constructor(
        private readonly pdfDownloadHistoryService: DownloadHistoryService
    ) {

    }
    @Query(() => PdfDownloadHistoryResult)
    async getHistory(
        @Args("paginationOptions") paginationOptions: PdfDownloadHistoryPaginationDTO,
        @GetTokenData('organizationid') orgId: number

    ): Promise<PdfDownloadHistoryResult> {
        return await this.pdfDownloadHistoryService.getHistory(paginationOptions, orgId);
    }

    @Mutation(() => Boolean)
    async removeDownloadHistory(@Args('id', { type: () => Int }) id: number): Promise<boolean> {
        try {
            return await this.pdfDownloadHistoryService.removeHistory(id);
        } catch (error) {
            console.error("Error removing download history:", error);
            throw new Error('Failed to delete download history.');
        }
    }

}
