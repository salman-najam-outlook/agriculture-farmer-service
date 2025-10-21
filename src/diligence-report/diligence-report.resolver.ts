import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { DiligenceReport,CheckProductionPlaceResult, DiligenceReportWithAnalytic, DiligenceReportStatusSummary, DiligenceReportProductSummary, AverageProcessingTimeSummary, AverageProcessingTimeResponse } from './entities/diligence-report.entity';
import {
  ChangeStatusOfDiligenceReportInput,
  CreateDiligenceActivityLogInput,
  DiligenceReportInput,
  DiligenceReportInputBySupplier,
  DiligenceReportsFilterInput,
  DiligenceReportsPaginatedResponse,
  RequestAdditionalInformationInput,
  RequestAdditionalInformationInputResponse,
  RemoveRequestAdditionalInformationResponse,
  SupplierDataInput,
  DiligenceCurrentStageInput,
  DiligenceReportIdInput,
  UpdateWhoAddPlaceDataInput,
  UpdatePointFarmDefaultAreaInput,
  GenerateComplianceByDiligenceResponse,
  DigiligenceReportStatusUpdate,
  BulkApproveBlockchainReportsInput,
  ShareReportOperatorInput,
  BulkAssignReportsInput,
  BulkApproveReportsInput,
  BulkRejectReportsInput,
  BulkOperationResponse,
  DiligenceActivityLogFilterInput,
  DiligenceActivityLogPaginatedResponse,
  DateFilterInput
} from './dto/create-diligence-report.input';
import { DdsReportSubmissionCountInput, DdsReportSubmissionCount } from './dto/dds-report-count.dto';
import { DashboardStatisticsDto, DashboardStatisticsResponse } from './dto/dashboard-statistics.dto';

import { GetTokenData } from 'src/decorators/get-token-data.decorator';
import { Organization } from 'src/users/entities/organization.entity';
import { GetClientIP } from 'src/core/decorators/get-client-ip.decorator';
import { DiligenceReportService } from './diligence-report.service';
import {DiligenceActivityLog} from "./entities/diligence-activity-log.entity";
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import { DeligenceReportCurrentStageResponse, DeligenceReportCurrentStageUpdateResponse, DeligenceReporBlockchainPublishUpdateResponse } from "./entities/diligence-report.entity"
import { Logger, UseInterceptors } from '@nestjs/common';
import { Job } from 'src/job/entities/job.entity';
import { UserMetadataInterceptor } from 'src/interceptors/user-metadata.interceptor';
import { TranslationService } from 'src/translation/translation.service';
import { RequestAdditionalInformation } from './entities/diligence-report-request-additional-request.entity';
import { UsersDdsService } from 'src/users/users-dds.service';
@Resolver(() => DiligenceReport)
export class DiligenceReportResolver {
  constructor(private readonly diligenceReportService: DiligenceReportService,
    private readonly translationService: TranslationService,
    private readonly userService: UsersDdsService,
     private readonly usersDdsService: UsersDdsService,
  ) {}


  // @Query(() => [DiligenceReport], { name: "diligenceReport" })
  // async findAll() {
  //   return await this.diligenceReportService.findAll();
  // }

  @Mutation(() => String)
  async disregardSummarySegment(
    @Args('id', { type: () => Int }) id: number,
    @Args('enableRiskAssessmentCriteria', { type: () => Boolean, nullable: true }) enableRiskAssessmentCriteria?: boolean,
    @Args('enableProtectedAndIndigenousAreas', { type: () => Boolean, nullable: true }) enableProtectedAndIndigenousAreas?: boolean,
  ): Promise<string> {
    const updateData = {
      enableRiskAssessmentCriteria,
      enableProtectedAndIndigenousAreas,
    };

    return this.diligenceReportService.disregardSummarySegment(id, updateData);
  }

  @Query(() => DeligenceReportCurrentStageResponse, { name:"diligenceReportCurrentStageInfo" })
  async diligenceReportCurrentStageInfo(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
     return this.diligenceReportService.getDuediligenceReportStage(id)  
  }

  @Mutation(() => DeligenceReportCurrentStageUpdateResponse)
  async updateDiligenceCurrentStage(
    @GetTokenData('userid') userId: number,
    @Args('diligenceCurrentStageInput') diligenceCurrentStageInput: DiligenceCurrentStageInput,
  ) {
    try {
      const { reportId, current_stage } = diligenceCurrentStageInput
      return await this.diligenceReportService.updateDueDeligenceStage(reportId, current_stage);
    } catch (error) {
      throw new Error(error);
    }
  }


  @Mutation(() => DeligenceReporBlockchainPublishUpdateResponse)
  async updateBlockchainPublishDate(
    @GetTokenData('userid') userId: number,
    @Args('digilenceId') digilenceId: DiligenceReportIdInput,
  ) {
    try {
      const { reportId  } = digilenceId
      return await this.diligenceReportService.updateBlockchainPublishDate(+reportId);
    } catch (error) {
      throw new Error(error);
    }
  }



  @Query(() => DiligenceReportsPaginatedResponse, { name: "diligenceReports" })
  async diligenceReports(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number | null,
    @Context() context: any,
    @Args('filter', { nullable: true }) filter?: DiligenceReportsFilterInput,
  ) {
    
    // to handle co-orperative wise report listings
    let finalSubOrganizationId = subOrganizationId;
    
    if (filter?.cooperativeId) { // cf suborganization id
      // Find the cooperative in organization table using cf_id
      const cooperative = await Organization.findOne({
        where: { 
          cf_id: filter.cooperativeId,
          isSubOrganization: true,
          parent_id: organizationId
        }
      });
      
      if (cooperative) {
        finalSubOrganizationId = cooperative.id;
      }
    }

    if (filter?.assignedTo) {
      try {
        const assignedToCfUser = await this.usersDdsService.findByCfID(filter.assignedTo);
        if (assignedToCfUser) {
          filter.assignedTo = assignedToCfUser.id;
        } else {
          filter.assignedTo = -1;
        }
      } catch (error) {
        console.error('Error finding user by CF ID:', error);
        filter.assignedTo = -1;
      }
    }
    
    if (filter?.assignedToIds?.length) {
      try {
        const mappedIds = [];
        for (const cfUserId of filter.assignedToIds) {
          const assignedToCfUser = await this.usersDdsService.findByCfID(cfUserId);
          if (assignedToCfUser) {
            mappedIds.push(assignedToCfUser.id);
          }
        }
        filter.assignedToIds = mappedIds;
      } catch (error) {
        console.error('Error finding users by CF IDs:', error);
        filter.assignedToIds = [];
      }
    }
    
    const result = await this.diligenceReportService.findAll(filter,organizationId,userId,finalSubOrganizationId, context);

    const rows = result.rows.map((row) => ({
        ...row.get({ plain: true }),
        productionPlaceCount: row.get('productionPlaceCount')
    }));

    const translatedData =   await this.translationService.translateObject(rows, context, ['status','id','operatorId','supplierId','createdAt','updatedAt','deletedAt','diligenceReportAssessment']);

    return {
      count: result.count,
      totalCount: result.totalCount,
      rows:translatedData
    };
  }


  @Query(() => DiligenceReportsPaginatedResponse, { name: "diligenceReportForOperator" })
  async diligenceReportsForOperator(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @Args('filter', { nullable: true }) filter?: DiligenceReportsFilterInput,
  ) {
    const result = await this.diligenceReportService.findAll({
      ...filter, operatorId: userId, supplierId: null
    },organizationId,userId);

    const rows = result.rows.map((row) => ({
      ...row.get(),
      productionPlaceCount: row.get('productionPlaceCount')
    }));

    return {
      count: result.count,
      totalCount: result.totalCount,
      rows
    };
  }


  @Query(() => DiligenceReportsPaginatedResponse, { name: "diligenceReportForSupplier" })
  async diligenceReportsForSupplier(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @Args('filter', { nullable: true }) filter?: DiligenceReportsFilterInput,
  ) {
    const result = await this.diligenceReportService.findAll({
      ...filter, operatorId: null, supplierId: userId, 
    },organizationId, userId);

    const rows = result.rows.map((row) => ({
      ...row.get(),
      productionPlaceCount: row.get('productionPlaceCount')
    }));

    return {
      count: result.count,
      totalCount: result.totalCount,
      rows
    };
  }
  
  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async createDiligenceReport(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number | null,
    @Args('createDiligenceReportInput') createDiligenceReportInput: DiligenceReportInput,
  ) {
    try {
      return await this.diligenceReportService.createDueDiligenceByOperator(createDiligenceReportInput, userId, organizationId, subOrganizationId);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async createDiligenceReportBySupplier(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number | null,
    @Args('createDiligenceReportInput') createDiligenceReportInput: DiligenceReportInputBySupplier,
  ) {
    try {
      return await this.diligenceReportService.createDueDiligenceBySupplier(createDiligenceReportInput, userId, organizationId, subOrganizationId);
    } catch (error) {
      throw new Error(error);
    }
  }


  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async updateDiligenceReport(
    @GetTokenData('userid') userId: number,
    @Args('updateDiligenceReportInput') updateDiligenceReportInput: DiligenceReportInput,
  ) {
    try {
      return await this.diligenceReportService.updateDueDiligenceByOperator(updateDiligenceReportInput, userId);
    } catch (error) {
      throw new Error(error);
    }
  }


  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async updateDueDiligenceReportBySupplier(
    @GetTokenData('userid') userId: number,
    @Args('updateDiligenceReportInput') updateDiligenceReportInput: DiligenceReportInputBySupplier,
  ) {
    try {
      return await this.diligenceReportService.updateDueDiligenceReportBySupplier(updateDiligenceReportInput, userId);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async changeStatusOfDiligenceReport(
    @GetTokenData('userid') userId: number,
    @Args('changeStatusOfDiligenceReportInput') changeStatusOfDiligenceReportInput: ChangeStatusOfDiligenceReportInput,
  ) {
    try {
      return await this.diligenceReportService.changeStatus(changeStatusOfDiligenceReportInput, userId);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async updateWhoAddsPlaceDataInDiligenceReport(
      @GetTokenData('userid') userId: number,
      @Args('updateWhoAddPlaceDataInput') updateWhoAddPlaceDataInput: UpdateWhoAddPlaceDataInput,
  ) {
    try {
      return await this.diligenceReportService.updateWhoAddPlaceData(updateWhoAddPlaceDataInput, userId);
    }
    catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async updatePointFarmDefaultArea(
      @GetTokenData('userid') userId: number,
      @Args('updatePointFarmDefaultAreaInput') updatePointFarmDefaultAreaInput: UpdatePointFarmDefaultAreaInput,
  ) {
    try {
      return await this.diligenceReportService.updatePointFarmDefaultArea(updatePointFarmDefaultAreaInput, userId);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async deleteDiligenceReport(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number  ) {
    try {
      await this.diligenceReportService.remove(id);
      return {id:id};
    } catch (error) {
      throw new Error(error);
    }
  }
  
  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async duplicateDiligenceReport(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number  ) {
    try {
      return await this.diligenceReportService.duplicate(id);
    } catch (error) {
      throw new Error(error);
    }
  }


  @Query(() => DiligenceReportWithAnalytic, { name: "getDiligenceDetail" })
  async getDiligenceDetail(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number

  ) {
    return await this.diligenceReportService.findOne(id);
  }

  /**
   * 
   * @param userId 
   * @param id 
   * @returns 
   * Check production place by number
   */
  @Query(() => CheckProductionPlaceResult, { name: "checkProductionPlaceFromReportId" })
  async checkProductionPlaceFromReportId(
    @GetTokenData('userid') userId: number,
    @Args('id', { type: () => Int }) id: number
  ) {
    return await this.diligenceReportService.checkProductionPlaceByReportId(id);
  }


  @Mutation(() => DiligenceActivityLog)
  async createDiligenceActivityLog(
      @Args('createDiligenceActivityLogInput') createDiligenceActivityLogInput: CreateDiligenceActivityLogInput,
      @Context() context: any,
  ) {
    try {
      // Extract IP address from GraphQL context
      let clientIP = 'unknown';
      
      try {
        // Get request object from GraphQL context
        let request: any = null;
        
        // Try multiple ways to get the request object from GraphQL context
        if (context && context.req) {
          request = context.req;
        } else if (context && context.request) {
          request = context.request;
        } else if (context && context.http) {
          request = context.http.req || context.http.request;
        }
        
        if (request) {
          // Primary: Get from request object (set by middleware)
          if (request.clientIP) {
            clientIP = request.clientIP;
          }
          // Secondary: Get from headers (set by middleware)
          else if (request.headers && request.headers['client_ip']) {
            clientIP = request.headers['client_ip'];
          }
          // Tertiary: Get from x-original-client-ip header (gateway service)
          else if (request.headers && request.headers['x-original-client-ip']) {
            clientIP = request.headers['x-original-client-ip'];
          }
        }
        
        // Debug logging
        console.log(`Client IP captured: ${clientIP}`);
        
      } catch (ipError) {
        console.warn('Failed to extract IP address from context:', ipError);
        clientIP = 'unknown';
      }
      
      // Set IP address in the input
      createDiligenceActivityLogInput.ip_address = clientIP !== 'unknown' ? clientIP : null;
      
      return await this.diligenceReportService.createDeligenceActivityLog(createDiligenceActivityLogInput);
    } catch (error) {
      console.error('Error in createDiligenceActivityLog:', error);
      throw new Error(error);
    }
  }


  @Query(() => [DiligenceActivityLog])
  async diligenceActivityLog(
      @Args('id', { type: () => Int }) id: number
  ) {
    try {
      return this.diligenceReportService.getDiligenceActivityLog(id)
    } catch (error) {
      throw new Error(error);
    }

  }

  @Query(() => DiligenceActivityLogPaginatedResponse)
  async diligenceActivityLogPaginated(
      @Args('id', { type: () => Int }) id: number,
      @Args('filter', { type: () => DiligenceActivityLogFilterInput, nullable: true }) filter?: DiligenceActivityLogFilterInput
  ) {
    try {
      return this.diligenceReportService.getDiligenceActivityLogPaginated(id, filter)
    } catch (error) {
      throw new Error(error);
    }
  }


  @Mutation(() => RequestAdditionalInformationInputResponse)
  @UseInterceptors(UserMetadataInterceptor)
  async requestAdditionalInformation(
    @GetTokenData('userid') userId: number,
    @Args('requestAdditionalInformationInput') requestAdditionalInformationInput: RequestAdditionalInformationInput,
    @GetTokenData("authorization") authorization: string
  ) {
    try {
      const authorizationS = authorization;
      await this.diligenceReportService.createRequestAdditionalInformation( userId, requestAdditionalInformationInput, authorizationS);
      return {
        success: true,
        message: "Data added successfully"
      }
    } catch (error) {
      throw new Error(error);
    }
  }


  @Query(() => RequestAdditionalInformation)
  @UseInterceptors(UserMetadataInterceptor)
  async getAdditionalInformation(
    @Args('id', { type: () => Int }) id: number
  ) {
    try {
      return await this.diligenceReportService.getRequestAdditionalInformationById(id);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => User)
  @UseInterceptors(UserMetadataInterceptor)
  async addSupplier(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @Args('supplierDataInput') supplierDataInput: SupplierDataInput,
  ) {
    try {
     return await this.diligenceReportService.addSupplier(userId, organizationId, supplierDataInput);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  async shareReportToOperator(
    @GetTokenData('cf_userid') userId: number,
    @Args('diligenceReportInput') diligenceReportInput: ShareReportOperatorInput,
  ) {
    try {
     return await this.diligenceReportService.attachOperator(userId, diligenceReportInput);
    } catch (error) {
      throw new Error(error);
    }
  }


  @Mutation(() => RequestAdditionalInformationInputResponse)
  @UseInterceptors(UserMetadataInterceptor)
  async sendEmailToSupplierOperator(
    @Args('supplierId', { type: () => Int, nullable: true }) supplierId: number,
    @Args('operatorId', { type: () => Int, nullable: true }) operatorId: number,
    @GetTokenData('cf_userid') userId: number,
  ) {
    try {
      if(supplierId){
        await this.diligenceReportService.sendEmailToSupplier(supplierId, userId);
      }
      else if(operatorId){
        await this.diligenceReportService.sendEmailToOperator(operatorId, userId);
      }
      return {
        success: true,
        message: "Email sent successfully"
      }
    } catch (error) {
      Logger.log('Error sending email to supplier:', error);
      return {
        success: false,
        message: "Failed to send email. Please try again later.",
      };
    }
  }
  
  @Mutation(() => Boolean)
  async sendToOperator(
    @GetTokenData('userid') userId: number,
    @Args('reportId', { type: () => Int }) reportId: number  ) {
    try {
       await this.diligenceReportService.sendToOperator(reportId);
       return true;
    } catch (error) {
      throw new Error(error);
    }
  }

  
  @Mutation(() => GenerateComplianceByDiligenceResponse)
  @UseInterceptors(UserMetadataInterceptor)
  async generateComplianceByDiligenceReportId(
    @Args('id', { type: () => Int }) diligenceReportId: number
  ) {
    try {
      const job = await this.diligenceReportService.generateComplianceByDiligenceId(diligenceReportId);
      return {
        success: true,
        job,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  @Query(() => [RequestAdditionalInformation])
  async getAllRequestAdditionalInformationByDiligenceId(
    @Args('id', { type: () => Int }) id: number
  ) {
    try {
      const results = await this.diligenceReportService.getAllRequestAdditionalInformationByDiligenceId(id);
      return results || [];
    } catch (error) {
      console.error('Error fetching additional information:', error);
      return [];
    }
  }

  @Mutation(() => RemoveRequestAdditionalInformationResponse)
  @UseInterceptors(UserMetadataInterceptor)
  async removeRequestAdditionalInformationByDiligenceId(
    @GetTokenData('userid') userId: number,
    @Args('dueDiligenceReportId', { type: () => Int }) dueDiligenceReportId: number
  ) {
    try {
      return await this.diligenceReportService.removeRequestAdditionalInformationByDiligenceId(dueDiligenceReportId);
    } catch (error) {
      throw new Error(error);
    }
  }

  @Mutation(() => DiligenceReport)
  @UseInterceptors(UserMetadataInterceptor)
  async updateGeolocationPrivacy(
    @GetTokenData('userid') userId: number,
    @Args('diligenceReportId', { type: () => Int }) diligenceReportId?: number,
    @Args('isGeolocationPrivate', { type: () => Boolean, nullable: true }) isGeolocationPrivate?: boolean,
  ) {
    try {
      return await this.diligenceReportService.updateGeolocationPrivacy(isGeolocationPrivate, diligenceReportId);
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * Bulk assign reports to a user
   */
  @Mutation(() => BulkOperationResponse)
  @UseInterceptors(UserMetadataInterceptor)
  async bulkAssignReports(
    @Args('input') input: BulkAssignReportsInput,
  ) {
    try {
      const assignedToCfId = await this.userService.findByCfID(input.assignedTo);
      return await this.diligenceReportService.bulkAssignReports(
        input.reportIds,
        assignedToCfId?.id, //id
        input.assignedTo, //cf_userid
      );
    } catch (error) {
      throw new Error(`Bulk assign operation failed: ${error.message}`);
    }
  }

  /**
   * Bulk approve reports
   */
  @Mutation(() => BulkApproveBlockchainReportsInput)
  @UseInterceptors(UserMetadataInterceptor)
  async bulkApproveReports(
    @Args('input') input: BulkApproveReportsInput,
  ) {
    try {
      const output =  await this.diligenceReportService.bulkApproveReports(
        input.reportIds,
        input.isTemporaryApproval,
        input.approvalExpirationValue,
        input.approvalExpirationUnit
      );
      return output
    } catch (error) {
      throw new Error(`Bulk approve operation failed: ${error.message}`);
    }
  }

  /**
   * Bulk reject reports
   */
  @Mutation(() => BulkOperationResponse)
  @UseInterceptors(UserMetadataInterceptor)
  async bulkRejectReports(
    @Args('input') input: BulkRejectReportsInput,
  ) {
    try {
      return await this.diligenceReportService.bulkRejectReports(
        input.reportIds,
        input.reason,
      );
    } catch (error) {
      throw new Error(`Bulk reject operation failed: ${error.message}`);
    }
  }



  /**
   * Get diligence reports status summary filtered by date 
   * 
   * Example GraphQL query:
   * query {
   *   diligenceReportsByDateFilter(
   *     dateFilter: "month"
   *   ) {
   *     statusLegend
   *     count
   *     percentage
   *   }
   * }
   * 
   * Date filter options: "today", "week", "month", "year", "all"
   * Returns count and percentage for each status legend
   */
  @Query(() => [DiligenceReportStatusSummary], { name: "diligenceReportsByDateFilter" })
  async diligenceReportsByDateFilter(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number | null,
    @Args('input') input: DateFilterInput,
    @Context() context: any,
  ) {
    return await this.diligenceReportService.getReportsByDateFilter(
      input.dateFilter || 'all', 
      organizationId, 
      userId, 
      subOrganizationId,
      input.startDate,
      input.endDate,
      input.productId,
      context
    );
  }

  /**
   * Get DDS reports count by specific products (Cocoa, Coffee, Rubber) filtered by date
   * 
   * Example GraphQL query:
   * query {
   *   diligenceReportsByProductAndDate(
   *     dateFilter: "all"
   *   ) {
   *     productName
   *     count
   *   }
   * }
   * 
   * Date filter options: "today", "week", "month", "year", "all"
   * Returns count for specific products only: Cocoa (ID: 2), Coffee (ID: 3), and Rubber (ID: 5)
   */
  @Query(() => [DiligenceReportProductSummary], { name: "diligenceReportsByProductAndDate" })
  async diligenceReportsByProductAndDate(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number | null,
    @Args('input') input: DateFilterInput,
    @Context() context: any,
  ) {
    return await this.diligenceReportService.getReportsByProductAndDate(
      input.dateFilter || 'all', 
      organizationId, 
      userId, 
      subOrganizationId,
      input.startDate,
      input.endDate,
      input.productId,
      context
    );
  }

  @Query(() => AverageProcessingTimeResponse, { name: "averageProcessingTimeByEmployee" })
  async averageProcessingTimeByEmployee(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number | null,
    @Args('input') input: DateFilterInput,
  ) {
    return await this.diligenceReportService.getAverageProcessingTimeByEmployee(
      input.dateFilter || 'all', 
      organizationId, 
      userId, 
      subOrganizationId,
      input.startDate,
      input.endDate,
      input.productId
    );
  }

  @Query(() => DdsReportSubmissionCount, { name: "ddsReportSubmissionCounts" })
  async getDdsReportSubmissionCounts(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number,
    @Args('input') input: DdsReportSubmissionCountInput,
    @Context() context: any,
  ): Promise<DdsReportSubmissionCount> {
    try {
      const inputWithOrganizationId = {
        ...input,
        organizationId: organizationId
      };

      return await this.diligenceReportService.getDdsReportSubmissionCounts(inputWithOrganizationId, userId, context);
    } catch (error) {
      throw new Error(`Failed to get DDS report submission counts: ${error.message}`);
    }
  }

  @Query(() => DashboardStatisticsResponse, { name: "dashboardStatistics" })
  async getDashboardStatistics(
    @GetTokenData('userid') userId: number,
    @GetTokenData('organizationid') organizationId: number,
    @GetTokenData('subOrganizationId') subOrganizationId: number,
    @GetTokenData('authorization') authorization: string,
    @Args('input') input: DashboardStatisticsDto,
  ): Promise<DashboardStatisticsResponse> {
    
    const inputWithTokenData = {
      ...input,
      organizationId,
      subOrganizationId
    };
    
    return this.diligenceReportService.getDashboardStatistics(inputWithTokenData, userId, authorization);
  }


}


