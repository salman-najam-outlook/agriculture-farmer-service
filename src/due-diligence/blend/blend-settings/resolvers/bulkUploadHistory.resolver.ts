import { Args, Mutation, Query, Resolver } from "@nestjs/graphql";
import { BlendBulkUploadHistory } from "../entities/blend-bulk-upload-history.entity";
import { BlendBulkUploadHistoryService } from "../services/bulkUploadHistory.service";
import { GetTokenData } from "src/decorators/get-token-data.decorator";
import { CreateBulkUploadHistoryInput } from "../dto/create-blend-bulk-upload-history.input";
import { BulkUploadHistoryInput, BulkUploadHistoryInputPaginatedResponse } from "../dto/blend-bulk-upload-history.input";

@Resolver(() => BlendBulkUploadHistory)
export class BlendBulkUploadHistoryResolver { 
    constructor(private readonly blendBulkUploadHistoryService: BlendBulkUploadHistoryService) { }
    
    @Query(() => BulkUploadHistoryInputPaginatedResponse, { name: 'getAllBulkUploadHistory' })
    async getAllBulkUploadHistory(
        @GetTokenData('organizationid') organizationId: number,
        @GetTokenData('userid') userId: number,
        @Args('filter', { nullable: false }) filter?: BulkUploadHistoryInput,
    ) {
        return await this.blendBulkUploadHistoryService.findAll(filter, organizationId);
    }

    @Mutation(() => BlendBulkUploadHistory, { name: 'createBulkUploadHistory' })
    async create(
        @Args('data') data: CreateBulkUploadHistoryInput,
    ): Promise<BlendBulkUploadHistory> {
        return await this.blendBulkUploadHistoryService.create(data);
    }
}