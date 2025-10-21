import { Inject, Injectable, HttpException, NotFoundException, Logger, forwardRef, ExecutionContext } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { emailParams } from 'src/mail/mail.interface';
import { MailService } from '../mail/mail.service';
import { UsersDdsService } from 'src/users/users-dds.service';
import { DiligenceReport, RiskWarning, DiligenceReportStatusSummary, DiligenceReportProductSummary, AverageProcessingTimeResponse } from './entities/diligence-report.entity';
import { DiligenceActivityLog } from "./entities/diligence-activity-log.entity";
import { UserDDS as User } from 'src/users/entities/dds_user.entity';
import {
    ChangeStatusOfDiligenceReportInput,
    CreateDiligenceActivityLogInput,
    DiligenceReportInput,
    DiligenceReportInputBySupplier,
    DiligenceReportsFilterInput,
    RequestAdditionalInformationInput,
    SupplierDataInput,
    UpdateWhoAddPlaceDataInput,
    UpdatePointFarmDefaultAreaInput,
    ShareReportOperatorInput
} from './dto/create-diligence-report.input';
import { Op,QueryTypes,literal } from "sequelize";
import { STATUS_LEGENDS } from '../constants/status-legends.constant';
import { StatusLegendUtil } from '../utils/status-legend.util';
import { DueDiligenceProductionPlace, EudrDeforestationStatus } from 'src/due-diligence/production-place/entities/production-place.entity';
import { ProductionPlaceDeforestationInfo } from 'src/due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { ProductionPlaceDisputes } from 'src/due-diligence/production-place/entities/production-place-dispute.entity';
import { RiskMitigationFiles } from 'src/due-diligence/production-place/entities/risk-mitigation-files.entity'
import { ProductionPlaceDisputeComments } from 'src/due-diligence/production-place/entities/dispute-comment.entity'
import { DiligenceReportAssessment } from './entities/diligence-report-assessment.entity';
import { Assesment } from 'src/assessment/entities/assessment.entity';
import { RequestAdditionalInformation } from './entities/diligence-report-request-additional-request.entity';
import { Job, JobStatus } from 'src/job/entities/job.entity';
import { BaseJobQueueable } from 'src/base-job-queueable';
import { Farm } from 'src/farms/entities/farm.entity';
import { DeforestationReportRequest } from 'src/deforestation/entities/deforestation_report_request.entity';
import { IBlockChainData, ReportStatus, ReportType } from 'src/deforestation/dto/create-deforestation.input';
import * as uuid from "uuid";
import * as moment from "moment";
import { S3Service } from 'src/upload/upload.service';
import { getFeeData, initializeEtherContract } from 'src/deforestation/contract';
import { utils } from 'ethers';
import { JobService } from 'src/job/job.service';
import { DiligenceReportTransaction } from './entities/diligence-report-transaction.entity';
import { createHash } from 'crypto';
import { AES as cryptoAES } from 'crypto-js';
import { AssessmentProductionPlace } from 'src/assessment-builder/entities/assessment-production-place.entity';
import { Organization } from 'src/users/entities/organization.entity';
import { SubProduct } from 'src/product/entities/sub-product.entity';
import { BlendProductFilter } from 'src/due-diligence/blend/blends/dto/blend-product.filter';
import { ManageProduct } from 'src/due-diligence/blend/manage-products/entities/manage-products.entity';
import { DiligenceReportProductionPlace } from './entities/diligence-report-production-place.entity';
import { URL } from "src/config/constant";
import { ApiCallHelper } from "src/helpers/api-call.helper";
import { RequestMethod } from "src/helpers/helper.interfaces";
import { DdsReportExporter } from './entities/dds-report-exporter.entity';
import { ApprovalFlowSettingsService } from '../due-diligence/approval-flow-setting/approval-flow-settings.service';
import { Shipment } from '../shipment/entities/shipment.entity';
import { PermissionService } from 'src/helpers/permission.service';
import { DdsReportSubmissionCountInput, DdsReportSubmissionCount } from './dto/dds-report-count.dto';
import { DashboardStatisticsDto, DashboardStatisticsResponse } from './dto/dashboard-statistics.dto';
import { PERMISSIONS } from 'src/config/permissions';


@Injectable()
export class DiligenceReportService extends BaseJobQueueable {
    // Static product IDs for Cocoa (2), Coffee (3), and Rubber (5)
    private static readonly STATIC_PRODUCT_IDS = [2, 3, 5];

    constructor(
        private mailService: MailService,
        private userService: UsersDdsService,
        private apiCallHelper: ApiCallHelper,
        private approvalFlowSettingsService: ApprovalFlowSettingsService,
        private permissionService: PermissionService,
        @InjectModel(DiligenceReport) private DiligenceReportModel: typeof DiligenceReport,
        @InjectModel(DdsReportExporter) private DdsReportExporterModel: typeof DdsReportExporter,
        @InjectModel(DueDiligenceProductionPlace) private DueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
        @InjectModel(ProductionPlaceDisputes) private ProductionPlaceDisputesModel: typeof ProductionPlaceDisputes,
        @InjectModel(RiskMitigationFiles) private RiskMitigationFilesModel: typeof RiskMitigationFiles,
        @InjectModel(ProductionPlaceDisputeComments) private ProductionPlaceDisputeCommentsModel: typeof ProductionPlaceDisputeComments,
        @InjectModel(DiligenceActivityLog) private DiligenceActivityLogModel: typeof DiligenceActivityLog,
        @InjectModel(DiligenceReportAssessment) private DiligenceReportAssessmentModel: typeof DiligenceReportAssessment,
        @InjectModel(RequestAdditionalInformation) private RequestAdditionalInformationModel: typeof RequestAdditionalInformation,
        @InjectModel(DeforestationReportRequest) private DeforestationReportRequestModel: typeof DeforestationReportRequest,
        @InjectModel(DiligenceReportTransaction) private DiligenceReportTransactionModel: typeof DiligenceReportTransaction,
        @InjectModel(DiligenceReportProductionPlace) private DiligenceReportProductionPlaceModel: typeof DiligenceReportProductionPlace,
        @InjectModel(ProductionPlaceDeforestationInfo) private ProductionPlaceDeforestationInfoModel: typeof ProductionPlaceDeforestationInfo,
        @InjectModel(Organization) private OrgModel: typeof Organization,
        @InjectModel(Farm) private FarmModel: typeof Farm,
        @Inject(forwardRef(() => JobService)) private jobService: JobService,

        @Inject('SEQUELIZE') private readonly sequelize: Sequelize,
        @Inject(S3Service) private readonly s3Service: S3Service,
    ) {
        super();
    }

    private async getCooperativesCountForDateRange(
        input: DashboardStatisticsDto,
        startDate?: string,
        endDate?: string,
        authorization?: string
    ): Promise<number> {
        try {
            // Build query parameters - no roles needed as API now applies registration type filters directly
            let queryParams = '';
            if (startDate && endDate) {
                queryParams = `startDate=${startDate}&endDate=${endDate}`;
            }
            
            const cooperativesResponse = await this.apiCallHelper.call(
                RequestMethod.GET,
                `${URL.CF_BASEURL}/admin/adminuserListByMultipleRoles${queryParams ? `?${queryParams}` : ''}`,
                {
                    'Content-Type': 'application/json',
                    'oauth-token': authorization || ''
                },
                {}
            );
            
            if (cooperativesResponse && cooperativesResponse.data && cooperativesResponse.data.data.count) {
                return cooperativesResponse.data.data.count;
            }
            
            return 0;
        } catch (error) {
            console.error('Error fetching cooperatives count for date range:', error);
            return 0;
        }
    }

    private async getExportersCountForDateRange(
        input: DashboardStatisticsDto,
        startDate?: string,
        endDate?: string,
        authorization?: string
    ): Promise<number> {
        try {
            // Build query parameters for the /exporters API
            let queryParams = '';
            const params = [];
            
            if (startDate && endDate) {
                params.push(`startDate=${startDate}&endDate=${endDate}`);
            }
            
            if (params.length > 0) {
                queryParams = `?${params.join('&')}`;
            }
            
            const exportersResponse = await this.apiCallHelper.call(
                RequestMethod.GET,
                `${URL.CF_BASEURL}/admin/exporters${queryParams}`,
                {
                    'Content-Type': 'application/json',
                    'oauth-token': authorization || ''
                },
                {}
            );
            
            if (exportersResponse && exportersResponse.data && exportersResponse.data.data && exportersResponse.data.data.count) {
                return exportersResponse.data.data.count;
            }
            
            return 0;
        } catch (error) {
            console.error('Error fetching exporters count for date range:', error);
            return 0;
        }
    }

    async disregardSummarySegment(
        id: number,
        updateData: { enableRiskAssessmentCriteria?: boolean; enableProtectedAndIndigenousAreas?: boolean },
    ): Promise<string> {
        const report = await this.DiligenceReportModel.findByPk(id);
        if (!report) {
        throw new Error(`DiligenceReport with id ${id} not found`);
        }

        await this.DiligenceReportModel.update(updateData, {
        where: { id },
        });

        return `Regional risk assessment summary section successfully updated`;
    }

    async updateBlockchainPublishDate(digilenceReportId:number) {
        const currentDate = new Date();
        currentDate.setHours(currentDate.getHours() + 72);
        
        await this.DiligenceReportModel.update({
            blockchainPublishDate:currentDate
        }, {
            where:{ id : digilenceReportId}
        })
        return {
            message:'Blockchain published date updated.',
            blockchainPublishDate:currentDate
        }
    }

    getAboveFourHectorFarm(item:DiligenceReportProductionPlace) {
        const hec = +item?.farm?.area * 0.404686
        const ha = hec.toFixed(2)
        if(+ha > 4) {
            return true
        } 
        return false
    }

    removeOrganizationSubOrgKeys(obj:any, both=true){
        const newObj = { ...obj };
        if(both){
            delete newObj.organizationId;
            delete newObj.subOrganizationId;
        }else{
            delete newObj.subOrganizationId;
        }
        return newObj; 
    }

    async findAll(filter:any, organizationId?: number, userId?:number, subOrganizationId?: number | null, context?: ExecutionContext) 
    {
        
        const cfRoles = filter?.cfroles || [];
        
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

        let where: any = {
            isDeleted:0,
            organizationId:organizationId,
        };

        if (subOrganizationId) {     
            where.subOrganizationId = subOrganizationId;   
        }


        /**
         * 
         * Temporary solution  
         * */
        if(cfRoles.includes("dds_exporter")) {
            const candidateExporter = await this.DdsReportExporterModel.findAll({where:{
                exporter_id:userId || null
            }})
            const reportIds = candidateExporter.map((item) => item.diligence_report_id);
            if(reportIds.length > 0) {
                where = this.removeOrganizationSubOrgKeys(where);
                where.id = {[Op.in]: reportIds};
            }else {
                where = this.removeOrganizationSubOrgKeys(where);
                where.id = {[Op.in]: []};
            }
         }  
         
         /**
          * Only for operator 
          */
         if(cfRoles.includes("operator")) {
            where = this.removeOrganizationSubOrgKeys(where);
            where.operatorId = userId
         }

         /**
          * only for indonesia_ptsi_worker
          */
         const hasWorkerPermission = context && await this.permissionService.checkPermission(PERMISSIONS.worker.value, context);
         if (hasWorkerPermission) {
             where = this.removeOrganizationSubOrgKeys(where, false);
             // Only set assignedTo to userId if assignedToMe filter is not being used
             if (!filter.assignedToMe) {
                 where.assignedTo = userId
             }
         }


        if (filter.statuses && filter.statuses.length > 0) {
            where.status = { [Op.in]: filter.statuses };
        } else if (filter.status) {
            where.status = filter.status;
        }

        if (filter.statusLegendsArray && filter.statusLegendsArray.length > 0) {
            const validStatusLegends = filter.statusLegendsArray.filter(status => 
                StatusLegendUtil.isValidStatusLegend(status)
            );
            
            if (validStatusLegends.length > 0) {
                where.statusLegends = { [Op.in]: validStatusLegends };
            }
        } else if (filter.statusLegend && StatusLegendUtil.isValidStatusLegend(filter.statusLegend)) {
            where.statusLegends = filter.statusLegend;
        }

        // Handle country filter
        if (filter.country && filter.country != "All Countries") {
            where.countryOfEntry = filter.country;
        }

        if (filter.exporterIds && filter.exporterIds.length > 0) {
            const exporterReports = await this.DdsReportExporterModel.findAll({
                where: {
                    exporter_cf_id: { [Op.in]: filter.exporterIds }
                },
                attributes: ['diligence_report_id']
            });
            
            const reportIds = exporterReports.map(item => item.diligence_report_id);
            if (reportIds?.length) {
                where.id = { [Op.in]: reportIds };
            } else {
                where.id = { [Op.in]: [] }; // No reports found for these exporters
            }
        } else if (filter.exporterId) {
            const exporterReports = await this.DdsReportExporterModel.findAll({
                where: {
                    exporter_cf_id: filter.exporterId
                },
                attributes: ['diligence_report_id']
            });
            
            const reportIds = exporterReports.map(item => item.diligence_report_id);
            if (reportIds.length > 0) {
                where.id = { [Op.in]: reportIds };
            } else {
                where.id = { [Op.in]: [] }; // No reports found for this exporter
            }
        }

        // Handle assignment filters - can be combined for "All" case
        const assignmentConditions = [];
        
        if (filter.assignedToMe) {
            // Include reports with NULL assignedTo (unassigned reports)
            assignmentConditions.push({ [Op.is]: null });
        }
        
        if (filter.assignedToIds && filter.assignedToIds.length > 0) {
            // Include reports assigned to specific users
            assignmentConditions.push({ [Op.in]: filter.assignedToIds });
        }
        
        if (filter.assignedTo) {
            // Include reports assigned to a specific user (legacy support)
            assignmentConditions.push(filter.assignedTo);
        }
        
        // Apply assignment conditions with OR logic if multiple conditions exist
        if (assignmentConditions.length > 0) {
            if (assignmentConditions.length === 1) {
                where.assignedTo = assignmentConditions[0];
            } else {
                where.assignedTo = { [Op.or]: assignmentConditions };
            }
        }


        if (filter.searchPhrase) {
            where.internalReferenceNumber = {
                [Op.like]: `%${filter.searchPhrase}%`
            };
        }

        // Handle date range filtering
        if (filter.startDate && filter.endDate) {
            where.createdAt = {
                [Op.between]: [filter.startDate, filter.endDate]
            };
        } else if (filter.startDate) {
            where.createdAt = {
                [Op.gte]: filter.startDate
            };
        } else if (filter.endDate) {
            where.createdAt = {
                [Op.lte]: filter.endDate
            };
        }

        // Handle filterType (date-based filtering)
        if (filter.filterType && filter.filterType !== 'all') {
            const dateRange = this.calculateDateRange(filter.filterType);
            if (dateRange.startDate && dateRange.endDate) {
                where.createdAt = {
                    [Op.between]: [dateRange.startDate, dateRange.endDate]
                };
            }
        }

        // Handle products filtering
        if (filter.products && filter.products.length > 0) {
            where.product = {
                [Op.in]: filter.products
            };
        }

        if (filter?.supplierIds && filter?.supplierIds.length > 0) {
            const suppliers = await this.userService.findByCFIds(filter?.supplierIds || [])
            const supplierInternalIds = suppliers?.map(supplier => supplier.id);
            if(supplierInternalIds?.length)
            {
                 where.userId = {
                    [Op.in]:supplierInternalIds
                }
            }
        } else if (filter?.supplierId) {
            const supplier = await this.userService.findByCfID(Number(filter.supplierId));
            
            // Get additional report IDs
            const additionalData = await RequestAdditionalInformation.findAll({
                where: {
                    cfUserid: filter.supplierId
                },
                attributes: ['dueDiligenceReportId']
            });
        
            const diligenceReportIds = additionalData.map(data => data.dueDiligenceReportId);
        
            // Base conditions that apply to all queries
            const baseConditions = {
                isDeleted: 0,
                organizationId,
                ...(filter.status && { status: filter.status })
            };
        
            // Build the OR conditions
            where[Op.or] = [
                {
                    ...baseConditions,
                    supplierId: supplier.id,
                    [Op.or]: [
                        {
                            sendToOperator: false,
                            whoAddPlaceData: 'supplier'
                        },
                        {
                            sendToOperator: true,
                            whoAddPlaceData: 'operator'
                        }
                    ]
                }
            ];
        
            if (diligenceReportIds.length > 0) {
                where[Op.or].push({
                    ...baseConditions,
                    id: { [Op.in]: diligenceReportIds }
                });
            }
        }     

        if (filter?.operatorId) {
            const operator = await this.userService.findByCfID(Number(filter.operatorId))
            where.operatorId = operator.id;
            where[Op.or] =  [
                {
                    sendToOperator: false,
                    whoAddPlaceData: 'supplier'
                },
                {
                    sendToOperator: true,
                    whoAddPlaceData: 'operator'
                }
            ]
        }

        let response: { totalCount?: any; count: any; rows: any };
        const ltr = `
            SELECT COUNT(p.id) FROM diligence_reports_due_diligence_production_places AS p
            INNER JOIN user_farms uf
                ON uf.id = p.farmId AND uf.isDeleted = 0
            INNER JOIN users_dds ud
                ON ud.id = uf.userDdsId
            WHERE
                p.diligenceReportId = DiligenceReport.id
                AND p.removed = 0
        `;
        response = await this.DiligenceReportModel.findAndCountAll({
            where,
            attributes: {
                include: [
                    [
                        literal(`(
                            ${ltr}
                        )`),
                        'productionPlaceCount'
                    ]
                ]
            },

            include: [
                {
                    model: User,
                    required: false,
                    attributes: ['id', 'firstName', 'lastName', 'eori_number'],
                    as: 'supplier'
                },
                {
                    model: User,
                    required: false,
                    attributes: ['id', 'firstName', 'lastName', 'eori_number'],
                    as: 'operator'
                },
                {
                    model: User,
                    required: false,
                    attributes: ['id', 'firstName', 'lastName', 'eori_number'],
                    as: 'assignedToUser'
                },
                {
                    model: ManageProduct,
                    required: false,
                    as: 'product_detail'
                },
                {
                    model: DiligenceReportAssessment,
                    as: "diligenceReportAssessment",
                    required: false,
                },
                {
                    model: RequestAdditionalInformation,
                    as: 'requestAdditionalInformation',
                    required: false,
                },
                {
                    model: Shipment,
                    as: 'shipment',
                    required: false,
                    through: { attributes: [] },
                    attributes: ['id', 'shipment_refrence_number', 'status']
                }
            ],
            offset: query.offset,
            limit: query.limit,
            order: [
                ['id', 'DESC']
            ],
            distinct: true,
        });

        response.totalCount = response.count;
        response.count = response.rows.length;

        // Check for overdue reports and update their status
        if (organizationId && response.rows.length > 0 && filter.isPtsiApproval) {
            await this.checkAndUpdateOverdueReports(response.rows, organizationId);
        }

        return response;
    }

    async findOne(id: number) {
        const report = await this.DiligenceReportModel.findOne({
            where: {
                id: id,
                isDeleted:0,
            },
            include: [
                {
                    model: DiligenceReportProductionPlace,
                    where:{ 
                        removed: 0
                    },
                    required: false,
                    include: [
                        {
                            model: AssessmentProductionPlace,
                            required: false,
                            attributes: [
                                'id', 'riskAssessmentStatus', 'assessmentId',
                            ],
                            as: 'all_risk_assessments',
                        },
                        {
                            model:Farm,
                            required:false,
                            attributes:['id','area'],
                            as:'farm'
                        }
                    ]
                },
                {
                    model: DiligenceReportTransaction,
                    attributes: ["transactionHash", "id"],
                    order: [['createdAt', 'DESC']],
                    limit: 1,
                },
                {
                    model: DiligenceReportAssessment,
                    as: "diligenceReportAssessment",
                    required: false,
                    include: [
                        {
                            model: Assesment,
                            as: "assessment",
                            required: false,
                        },
                    ],
                },
                {
                    model: ManageProduct,
                    required: false,
                    as: 'product_detail'
                },
                'supplier',
                'operator',
                'user',
                'ddsReportExporter',
            ],
        });

        if (!report) {
            throw new NotFoundException(`Diligence Report with ID ${id} not found.`);
        }

        const reportMetrics = await this.sequelize.query(`
        SELECT
            COUNT(
                DISTINCT(CASE WHEN g.geofenceRadius IS NULL THEN uf.id ELSE NULL END)
            ) AS polygonProductionPlaces,
            COUNT(
                DISTINCT(CASE WHEN g.geofenceRadius IS NOT NULL THEN uf.id ELSE NULL END)
            ) AS pointProductionPlaces,
            SUM(uf.area) * COUNT(uf.id) / COUNT(DISTINCT (uf.id)) AS totalArea,
            COUNT(DISTINCT(uf.id)) AS totalProductionPlaces,
            COUNT(DISTINCT(CASE WHEN ppdi.deforestationStatus LIKE "High%" OR ppdi.deforestationStatus LIKE "Very High%" OR ppdi.deforestationStatus LIKE "Low%" OR ppdi.deforestationStatus LIKE "Medium%" THEN drpp.id ELSE NULL END)) AS totalHighDeforestationProductionPlaces,
            COUNT(DISTINCT(CASE WHEN ppdi.deforestationStatus = "NA" OR ppdi.deforestationStatus IS NULL THEN drpp.id ELSE NULL END)) AS totalUnknownDeforestationProductionPlaces,
            COUNT(DISTINCT(CASE WHEN ppdi.deforestationStatus IS NULL THEN NULL ELSE drpp.id END)) AS totalDeforestationAssessments
        FROM
            diligence_reports_due_diligence_production_places drpp
        INNER JOIN user_farms uf
            ON
            uf.id = drpp.farmId
            AND uf.isDeleted = false
        INNER JOIN geofences g
        ON
        g.farmId = uf.id
            AND g.isPrimary = true
            AND g.is_deleted = false
        LEFT JOIN production_place_deforestation_info ppdi
        ON ppdi.id = drpp.productionPlaceDeforestationInfoId
        WHERE
            drpp.removed = false
            AND drpp.diligenceReportId = :reportId;
        `, {
            replacements: { reportId: id },
            plain: true,
        });

        const fetchAllProductionPlacesByDiligenceReportId = await this.sequelize.query(`
            SELECT dp.*
            FROM due_diligence_production_places dp
            WHERE dp.farmId IN (
                SELECT dr.farmId
                FROM diligence_reports_due_diligence_production_places dr
                WHERE dr.diligenceReportId = :reportId AND dr.removed = 0
            )
        `, {
            replacements: { reportId: id },
            type: QueryTypes.SELECT
        });
        const reportData = report.toJSON();
        
        if (report.transactions.length > 0) {
            reportData.transaction = reportData.transactions[0];
            delete reportData.transactions;
            reportData["blockchainLink"] = `${process.env.ETHER_SCAN}/${encodeURIComponent(reportData.transaction.transactionHash)}`;
        }

        for(const [key, value] of Object.entries(reportMetrics)) {
            reportData[key] = value;
        }
      
        // Returning encrypted ID
        reportData["encId"] = cryptoAES.encrypt(`${report.id}`, process.env.DDS_PUBLIC_REPORT_KEY).toString();
        const riskWarnings: RiskWarning[] = [];
        const locationVerification = {
            id: null,
            assessmentName: "Location Verification",
            count: 0,
            currentStep: 3
        };
        if(fetchAllProductionPlacesByDiligenceReportId?.length) {
            fetchAllProductionPlacesByDiligenceReportId.map((productionPlace: { id: number; warnings?: any }) => {
                if (productionPlace?.warnings && productionPlace.warnings?.length) {
                    const {is_ocean, country} =  productionPlace.warnings[0]
                    if(is_ocean || 
                        (report?.countryOfProduction.length && (report?.countryOfProduction[0] !=  country))
                    ){
                        locationVerification.id = productionPlace.id;
                        locationVerification.count++;
                    } 
                }
            })
        }

        if(report?.dueDiligenceProductionPlaces.length) {
            for(let x of report?.dueDiligenceProductionPlaces){
                const hasCoordinate = await x?.farm?.hasCoordinates()
                if(!hasCoordinate && this.getAboveFourHectorFarm(x)){
                    locationVerification.id = x?.dueDiligenceProductionPlaceId;
                    locationVerification.count++;
                }
            }
        }

        if (locationVerification?.count > 0) {
            riskWarnings.push(locationVerification);
        }

        const deforestationAssessment = {
            id: null,
            assessmentName: "EUDR Deforestation Assessment",
            count: 0,
            currentStep: 4
        };
        if (
          (reportData?.totalHighDeforestationProductionPlaces || 0) > 0 ||
          (reportData?.totalUnknownDeforestationProductionPlaces || 0) > 0
        ) {
          deforestationAssessment.id = reportData.id;
          deforestationAssessment.count =
            (reportData.totalHighDeforestationProductionPlaces || 0) +
            (reportData.totalUnknownDeforestationProductionPlaces || 0);
          riskWarnings.push(deforestationAssessment);
        }
        if(report.diligenceReportAssessment.length && report.dueDiligenceProductionPlaces.length) {
            report.diligenceReportAssessment.forEach((diligenceAssessment, index) => {
                const assessmentId = diligenceAssessment.assessment_id;
                const baseStep = report.enableRegionalRiskAssessment ? 5 : 4;
                const riskWarning: RiskWarning = {
                    id: assessmentId,
                    assessmentName: diligenceAssessment.assessment.title,
                    count: 0,
                    currentStep: baseStep + (index + 1) 
                };
                report.dueDiligenceProductionPlaces.forEach(place => {
                    const placeAssessment = place.all_risk_assessments.find(assessment => assessment.assessmentId == assessmentId && assessment.riskAssessmentStatus === 'approved');
                    if(!placeAssessment) {
                        riskWarning.count = riskWarning.count+ 1
                    }
                });
                if(riskWarning?.count > 0) {
                    riskWarnings.push(riskWarning);
                }

            });
        }
        reportData["riskWarnings"] = riskWarnings;
        return reportData;
    }

    async createDueDiligenceByOperator(createDiligenceReportInput: DiligenceReportInput, userId: number, organizationId: number, subOrganizationId:any=null): Promise<DiligenceReport> {
        let transaction = await this.sequelize.transaction();
        try {
            let supplierId = createDiligenceReportInput.supplier.id;
            const internalRefNumber = createDiligenceReportInput.internalReferenceNumber;
            let diligenceReportInput: any = {
                ...createDiligenceReportInput,
                userId: userId,
                supplierId: supplierId,
                organizationId,
                is_dds_status_update: 0,
                subOrganizationId:subOrganizationId ? parseInt(subOrganizationId) : null
            };

            if(internalRefNumber){
                const internalRefExists = await this.DiligenceReportModel.findOne({
                    where: {
                        internalReferenceNumber: diligenceReportInput.internalReferenceNumber,
                    }
                });

                if (internalRefExists) {
                    throw new Error("Internal Reference Number must be unique across the system.");
                }
            }
            // insert data into the user farm coordinates
            const diligenceReport = await this.DiligenceReportModel.create(diligenceReportInput, { transaction });

            for (const requiredAssessment of diligenceReportInput.requiredAssessment) {
                const assessment = {
                    user_id: userId,
                    diligence_id: diligenceReport.id,
                    assessment_id: requiredAssessment.id,
                    existing_survey: requiredAssessment.type.includes("Existing") ? 'existing' : requiredAssessment.type.includes("Survey") ? 'survey' : 'farmer',
                    placement: requiredAssessment.farm == 'One for All Farms' ? 'one_for_all' : 'one_for_each',
                };

                await this.DiligenceReportAssessmentModel.create(assessment, { transaction });

            }
            await transaction.commit();

            return diligenceReport;
        } catch (error) {
            await transaction.rollback();
            Logger.log('Report create error', error);

            throw error;
        }
    }
    async createDueDiligenceBySupplier(createDiligenceReportInput: DiligenceReportInputBySupplier, userId: number, organizationId: number, subOrganizationId:any=null): Promise<DiligenceReport> {
        //let transaction = await this.sequelize.transaction();
        try {
                let operatorId = null;
                const internalRefNumber = createDiligenceReportInput.internalReferenceNumber;
                if(createDiligenceReportInput?.countryOfProduction.length > 1) {
                    throw new HttpException('Please select only one country of production.', 400);
                }

                if(createDiligenceReportInput?.operator?.id || createDiligenceReportInput?.operator?.email) { 
                    if (!createDiligenceReportInput?.operator?.id) {
                        if (!createDiligenceReportInput.operator.email) {
                            throw new HttpException("Email doesn't exists", 400);
                        }
                        const userExist: any = await this.userService.findOneByEmail(createDiligenceReportInput.operator.email);
                        if (!userExist) {
                            let nameParts = createDiligenceReportInput.operator.fullName.trim().split(' ');
                            let firstName = nameParts[0] || "";
                            let lastName = nameParts[nameParts.length - 1] || "";
                            const userInfo: any = {
                                role: 'operator',
                                email: createDiligenceReportInput.operator.email,
                                firstName: firstName,
                                lastName: lastName,
                                countryId: createDiligenceReportInput.operator.country,
                                mobile: createDiligenceReportInput.operator.mobile,
                                verified: 0,
                                organization:organizationId
                            }
                            const usere = await this.userService.create(userInfo);
                            operatorId = usere.id;
                        } else {
                            operatorId = userExist.id;
                        }
                    } else {
                        operatorId = createDiligenceReportInput?.operator?.id;
                    }  
                }
                

            let diligenceReportInput: any = {
                ...createDiligenceReportInput,
                userId: userId,
                operatorId: operatorId,
                organizationId,
                is_dds_status_update: 0,
                subOrganizationId:subOrganizationId ? parseInt(subOrganizationId) : null
            };
            

            if(internalRefNumber){
                const internalRefExists = await this.DiligenceReportModel.findOne({
                    where: {
                        internalReferenceNumber: diligenceReportInput.internalReferenceNumber,
                    }
                });

                if (internalRefExists) {
                    throw new Error("Internal Reference Number must be unique across the system.");
                }
            }
            // insert data into the user farm coordinates
            const diligenceReport = await this.DiligenceReportModel.create(diligenceReportInput);

            for (const requiredAssessment of diligenceReportInput.requiredAssessment) {
                const assessment = {
                    user_id: userId,
                    diligence_id: diligenceReport.id,
                    assessment_id: requiredAssessment.id,
                    existing_survey: requiredAssessment.type.includes("Existing") ? 'existing' : requiredAssessment.type.includes("Survey") ? 'survey' : 'farmer',
                    placement: requiredAssessment.farm == 'One for All Farms' ? 'one_for_all' : 'one_for_each',
                };

                await this.DiligenceReportAssessmentModel.create(assessment);
            }
            
            if( createDiligenceReportInput?.exporter_id) {
                /** Assign Exporter to this report if available */
                await this.assignDDSExporterToReport(diligenceReport.id, createDiligenceReportInput?.exporter_id, userId);
            }

            return diligenceReport;
        } catch (error) {
            //await transaction.rollback();
            Logger.log('Report create error', error);

            throw error;
        }
    }

    async updateDueDiligenceByOperator(updateDiligenceReportInput: DiligenceReportInput, userId: number,): Promise<DiligenceReport> {
        
        try {

            let supplierId = updateDiligenceReportInput.supplier.id;
           
            let diligenceReportInput: any = {
                ...updateDiligenceReportInput,
                userId: userId
            };
            diligenceReportInput.supplierId = supplierId
            // insert data into the user farm coordinates

            await this.DiligenceReportModel.update({
                ...diligenceReportInput,
                userId
            }, {
                where: {
                    id: diligenceReportInput.id
                }
            });


            const existingAssessments = await this.DiligenceReportAssessmentModel.findAll({
                where: { diligence_id: diligenceReportInput.id }
            });

            for (const requiredAssessment of diligenceReportInput.requiredAssessment) {
                const assessment = {
                    user_id: userId,
                    diligence_id: diligenceReportInput.id,
                    assessment_id: requiredAssessment.id,
                    existing_survey: requiredAssessment.type.includes("Existing") ? 'existing' : requiredAssessment.type.includes("Survey") ? 'survey' : 'farmer',
                    placement: requiredAssessment.farm == 'One for All Farms' ? 'one_for_all' : 'one_for_each',
                };

                const existingAssessment = existingAssessments.find(a => a.assessment_id === requiredAssessment.id);
                if (existingAssessment) {
                    await this.DiligenceReportAssessmentModel.update(assessment, {
                        where: { id: existingAssessment.id }
                    });
                } else {
                    await this.DiligenceReportAssessmentModel.create(assessment);
                }
            }

            // Optionally remove assessments that are no longer present in the input
            const inputAssessmentIds = diligenceReportInput.requiredAssessment.map(ra => ra.id);
            const assessmentsToRemove = existingAssessments.filter(a => !inputAssessmentIds.includes(a.assessment_id));
            for (const assessmentToRemove of assessmentsToRemove) {
                await this.DiligenceReportAssessmentModel.destroy({
                    where: { id: assessmentToRemove.id }
                });
            }


            //await transaction.commit();

            const diligenceReport = await this.DiligenceReportModel.findOne({
                where: {
                    id: diligenceReportInput.id
                }
            },);

            /** Assign Exporter to this report if available */
            if(diligenceReportInput?.exporter_id) {
               await this.assignDDSExporterToReport(diligenceReport.id, diligenceReportInput?.exporter_id, userId);
            } else if (
                diligenceReportInput?.exporter_id == null &&
                ((diligenceReportInput as any)?.operator?.id || (diligenceReport as any)?.operatorId)
            ) {
                await this.DdsReportExporterModel.destroy({
                    where: { diligence_report_id: diligenceReport.id },
                });
            }
            
            
            return diligenceReport;
        } catch (error) {
            //await transaction.rollback();
            Logger.log('Report create error', error);
            throw error;
        }
    }

    async updateDueDiligenceReportBySupplier(updateDiligenceReportInput: DiligenceReportInputBySupplier, userId: number,): Promise<DiligenceReport> {
        try {
            let operatorId = null;
            if(updateDiligenceReportInput?.countryOfProduction.length > 1) {
                throw new HttpException('Please select only one country of production.', 400);
            }

            if(updateDiligenceReportInput?.operator?.id || updateDiligenceReportInput?.operator?.email) {
                if (!updateDiligenceReportInput.operator.id) {
                    if (!updateDiligenceReportInput.operator.email) {
                        throw new HttpException(`Email doesn't exists`, 400);
                    }
                    const userExist: any = await this.userService.findOneByEmail(updateDiligenceReportInput.operator.email);
                    if (!userExist) {
                        let nameParts = updateDiligenceReportInput.operator.fullName.trim().split(' ');
                        let firstName = nameParts[0] || "";
                        let lastName = nameParts[nameParts.length - 1] || "";

                        const userInfo: any = {
                            role: 'operator',
                            email: updateDiligenceReportInput.operator.email,
                            firstName: firstName,
                            lastName: lastName,
                            countryId: updateDiligenceReportInput.operator.country,
                            mobile: updateDiligenceReportInput.operator.mobile,
                            eori_number: updateDiligenceReportInput.operator.eori_number
                        }
                        const usere = await this.userService.create(userInfo);
                        operatorId = usere.id;
                        
                    } else {
                        operatorId = userExist.id;
                    }

                } else {
                    operatorId = updateDiligenceReportInput.operator.id;
                }
            }
            
            let diligenceReportInput: any = {
                ...updateDiligenceReportInput,
                userId: userId
            };
            diligenceReportInput.operatorId = operatorId
            // insert data into the user farm coordinates

            await this.DiligenceReportModel.update({
                ...diligenceReportInput,
                userId
            }, {
                where: {
                    id: diligenceReportInput.id
                }
            });


            const existingAssessments = await this.DiligenceReportAssessmentModel.findAll({
                where: { diligence_id: diligenceReportInput.id }
            });

            for (const requiredAssessment of diligenceReportInput.requiredAssessment) {
                const assessment = {
                    user_id: userId,
                    diligence_id: diligenceReportInput.id,
                    assessment_id: requiredAssessment.id,
                    existing_survey: requiredAssessment.type.includes("Existing") ? 'existing' : requiredAssessment.type.includes("Survey") ? 'survey' : 'farmer',
                    placement: requiredAssessment.farm == 'One for All Farms' ? 'one_for_all' : 'one_for_each',
                };

                const existingAssessment = existingAssessments.find(a => a.assessment_id === requiredAssessment.id);
                if (existingAssessment) {
                    await this.DiligenceReportAssessmentModel.update(assessment, {
                        where: { id: existingAssessment.id }
                    });
                } else {
                    await this.DiligenceReportAssessmentModel.create(assessment);
                }
            }

            // Optionally remove assessments that are no longer present in the input
            const inputAssessmentIds = diligenceReportInput.requiredAssessment.map(ra => ra.id);
            const assessmentsToRemove = existingAssessments.filter(a => !inputAssessmentIds.includes(a.assessment_id));
            for (const assessmentToRemove of assessmentsToRemove) {
                await this.DiligenceReportAssessmentModel.destroy({
                    where: { id: assessmentToRemove.id }
                });
            }

            const diligenceReport = await this.DiligenceReportModel.findOne({
                where: {
                    id: diligenceReportInput.id
                }
            },);

            if( updateDiligenceReportInput?.exporter_id) {
                await this.assignDDSExporterToReport(diligenceReport.id, diligenceReportInput?.exporter_id, userId);
            } else if (
                updateDiligenceReportInput?.exporter_id == null &&
                (operatorId != null || (diligenceReport as any)?.operatorId)
            ) {
                await this.DdsReportExporterModel.destroy({
                    where: { diligence_report_id: diligenceReport.id },
                });
            }

            return diligenceReport;
        } catch (error) {
            //await transaction.rollback();
            Logger.log('Report create error', error);
            throw error;
        }
    }

    

    async changeStatus(changeStatusDiligenceReportInput: ChangeStatusOfDiligenceReportInput, userId: number | null = null): Promise<DiligenceReport> {
        let transaction = await this.sequelize.transaction();
        try {

            if (!changeStatusDiligenceReportInput.id) {
                throw new HttpException(`Report doesn't exists`, 400);

            }

            await this.DiligenceReportModel.update({
                status: changeStatusDiligenceReportInput.status
            }, {
                where: {
                    id: changeStatusDiligenceReportInput.id
                }
            },);

            await transaction.commit();

            const diligenceReport = await this.DiligenceReportModel.findOne({
                where: {
                    id: changeStatusDiligenceReportInput.id
                }
            },);

            return diligenceReport;
        } catch (error) {
            await transaction.rollback();
            Logger.log('Report create error', error);

            throw error;
        }
    }

    async updateWhoAddPlaceData(updateWhoAddPlaceDataInput: UpdateWhoAddPlaceDataInput, userId: number,): Promise<DiligenceReport> {
        let transaction = await this.sequelize.transaction();
        try {

            if (!updateWhoAddPlaceDataInput.id) {
                throw new HttpException(`Report doesn't exists`, 400);

            }

            const updateData = {
                whoAddPlaceData: updateWhoAddPlaceDataInput.whoAddPlaceData,
                status: undefined,
                sendToOperator:updateWhoAddPlaceDataInput.whoAddPlaceData == 'operator' ? true:false
            };

            if (updateWhoAddPlaceDataInput.status !== undefined) {
                updateData.status = updateWhoAddPlaceDataInput.status;
            }


            await this.DiligenceReportModel.update(updateData, {
                where: {
                    id: updateWhoAddPlaceDataInput.id
                }
            },);

            await transaction.commit();

            const diligenceReport = await this.DiligenceReportModel.findOne({
                where: {
                    id: updateWhoAddPlaceDataInput.id
                }
            },);

            return diligenceReport;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async updatePointFarmDefaultArea(updatePointFarmDefaultAreaInput: UpdatePointFarmDefaultAreaInput, userId: number,): Promise<DiligenceReport> {
        let transaction = await this.sequelize.transaction();
        try {
    
            if (!updatePointFarmDefaultAreaInput.id) {
                throw new HttpException(`Report doesn't exists`, 400);
    
            }
    
            await this.DiligenceReportModel.update({
                pointFarmDefaultArea: updatePointFarmDefaultAreaInput.pointFarmDefaultArea
            }, {
                where: {
                    id: updatePointFarmDefaultAreaInput.id
                }
            },);
    
            await transaction.commit();
    
            const diligenceReport = await this.DiligenceReportModel.findOne({
                where: {
                    id: updatePointFarmDefaultAreaInput.id
                }
            },);
    
            return diligenceReport;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async remove(id: number): Promise<number[]> {
 
        return await this.DiligenceReportModel.update({
            isDeleted:true
        },{
            where: {
                id
            }
        });
    }


    async createDeligenceActivityLog(input: CreateDiligenceActivityLogInput) {
        const { diligence_id, user_id, activity, description, ip_address } = input;
        
        try {
            const newLog = await this.DiligenceActivityLogModel.create({ 
                diligence_id, 
                user_id, 
                activity, 
                description,
                ip_address: ip_address || null
            });
            return newLog;
        } catch (error) {
            return null;
        }
    }

    async getDiligenceActivityLog(id) {
        const where: any = {
            diligence_id: id
        };
        const include = [
            {
                model: DiligenceReport,
                where: {},
                required: true
            }, {
                model: User,
                where: {},
                required: true
            }
        ]
        const diligenceReports = await this.DiligenceActivityLogModel.findAll({ where, include })
        return diligenceReports;
    }

    async getDiligenceActivityLogPaginated(id: number, filter?: any) {
        const page = filter?.page || 1;
        const limit = filter?.limit || 10;
        const offset = (page - 1) * limit;
        
        const where: any = {
            diligence_id: id
        };

        // Add search functionality
        if (filter?.searchPhrase) {
            where[Op.or] = [
                { activity: { [Op.like]: `%${filter.searchPhrase}%` } },
                { description: { [Op.like]: `%${filter.searchPhrase}%` } }
            ];
        }

        // Add user role filter
        if (filter?.userRole) {
            where['$user.role$'] = filter.userRole;
        }

        // Add activity filter
        if (filter?.activity) {
            where.activity = filter.activity;
        }

        const include = [
            {
                model: DiligenceReport,
                where: {},
                required: true
            }, {
                model: User,
                where: {},
                required: true
            }
        ];

        // Handle ordering
        let order: any = [['createdAt', 'DESC']]; // Default order
        if (filter?.orderField && filter?.order) {
            const orderDirection = filter.order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
            order = [[filter.orderField, orderDirection]];
        }

        const { rows, count } = await this.DiligenceActivityLogModel.findAndCountAll({
            where,
            include,
            limit,
            offset,
            order
        });

        return {
            rows,
            count: rows.length,
            totalCount: count
        };
    }


    async duplicate(reportId: number) {

        let transaction = await this.sequelize.transaction();

        const report = await this.DiligenceReportModel.findOne({
            where: {
                id: reportId
            }
        })

        const plainReport = report.get({ plain: true });

        const {
            id,
            ...reportDetail
        } = plainReport;

        const diligenceReport = await this.DiligenceReportModel.create(reportDetail, { transaction });


        let diligencePlaces = await this.DueDiligenceProductionPlaceModel.findAll({
            where: {
                dueDiligenceReportId: reportId
            },
            attributes: [
                'id',
                'createdAt',
                'updatedAt',
                'eudr_deforestation_status',
                'risk_mitigation_comment',
                'removed',
                'dueDiligenceReportId',
                'farmId',
                'assessment_data'
            ]
        });


        for (const diligencePlace of diligencePlaces) {

            let id = diligencePlace.id;
            let diligencePlaceDetail = {
                'createdAt': diligencePlace.createdAt,
                'updatedAt': diligencePlace.updatedAt,
                'eudr_deforestation_status': diligencePlace.eudr_deforestation_status,
                'risk_mitigation_comment': diligencePlace.risk_mitigation_comment,
                'removed': diligencePlace.removed,
                'dueDiligenceReportId': diligencePlace.dueDiligenceReportId,
                'farmId': diligencePlace.farmId,
                'assessment_data': diligencePlace.assessment_data
            }
            diligencePlaceDetail.dueDiligenceReportId = diligenceReport.id;

            let newDiligencePlaces = await this.DueDiligenceProductionPlaceModel.create(diligencePlaceDetail, { transaction });

            let diligencePlacesDisputes = await this.ProductionPlaceDisputesModel.findAll({
                where: {
                    productionPlaceId: id
                }
            });

            for (const diligencePlacesDispute of diligencePlacesDisputes) {

                let id = diligencePlacesDispute.id;


                let diligencePlacesDisputeDetail = {

                    id: diligencePlacesDispute.id,
                    productionPlaceId: diligencePlacesDispute.productionPlaceId,


                    createdBy: diligencePlacesDispute.createdBy,
                    title: diligencePlacesDispute.title,


                    description: diligencePlacesDispute.description,
                    s3Key: diligencePlacesDispute.s3Key,

                    s3Location: diligencePlacesDispute.s3Location,
                    // / public:diligencePlacesDispute.public,
                    createdAt: diligencePlacesDispute.createdAt,
                    updatedAt: diligencePlacesDispute.updatedAt
                }


                diligencePlacesDisputeDetail.productionPlaceId = newDiligencePlaces.id;

                let newDiligencePlacesDisputes = await this.ProductionPlaceDisputesModel.create(diligencePlacesDisputeDetail, { transaction });

                let diligencePlacesDisputesComments = await this.ProductionPlaceDisputeCommentsModel.findAll({
                    where: {
                        disputeId: id
                    }
                });


                for (const diligencePlacesDisputesComment of diligencePlacesDisputesComments) {

                    let id = diligencePlacesDisputesComment.id;


                    let diligencePlacesDisputesCommentDetail = {
                        id: diligencePlacesDisputesComment.id,
                        disputeId: diligencePlacesDisputesComment.disputeId,

                        commentedBy: diligencePlacesDisputesComment.commentedBy,
                        comment: diligencePlacesDisputesComment.comment,
                        s3Key: diligencePlacesDisputesComment.s3Key,
                        s3Location: diligencePlacesDisputesComment.s3Location,
                        createdAt: diligencePlacesDisputesComment.createdAt,
                        updatedAt: diligencePlacesDisputesComment.updatedAt
                    }


                    diligencePlacesDisputesCommentDetail.disputeId = newDiligencePlacesDisputes.id;

                    let newDiligencePlacesDisputesComment = await this.ProductionPlaceDisputeCommentsModel.create(diligencePlacesDisputesCommentDetail, { transaction });

                }
            }


            let diligenceRiskMitigations = await this.RiskMitigationFilesModel.findAll({
                where: {
                    production_place_id: id
                }
            });

            for (const diligenceRiskMitigation of diligenceRiskMitigations) {
                let id = diligenceRiskMitigation.id;

                let diligenceRiskMitigationDetail = {
                    production_place_id: diligenceRiskMitigation.production_place_id,
                    file_path: diligenceRiskMitigation.file_path,
                    createdAt: diligenceRiskMitigation.createdAt,
                    updatedAt: diligenceRiskMitigation.updatedAt
                }
                diligenceRiskMitigationDetail.production_place_id = newDiligencePlaces.id;

                let newDiligenceRiskMitigation = await this.RiskMitigationFilesModel.create(diligenceRiskMitigationDetail, { transaction });
            }


        }

        await transaction.commit();

        return diligenceReport;
    }
      private async sendPushNotificationToUsers(
        title: string,
        ddrId: number,
        userIds: number[],
        authorization: string,
        additionalInformation: any,
      ) {
        try {
          const notificationData = {
            title,
            type: "ddr_additional_information",
            notify: "user",
            message: `You have been requested to submit additional information for DDR ID: ${ddrId} as part of EUDR Due Diligence.`,
            users: userIds,
            data: JSON.stringify({
                ddrId,
                dueDiligenceRequestAdditionalInformationId: additionalInformation.id,
                message: additionalInformation.description
            }),
          };

          const endpoint = `${URL.CF_BASEURL}/admin/notification`;
          
          const { data } = await this.apiCallHelper.call(
            RequestMethod.POST,
            endpoint,
            {
              "oauth-token": authorization,
            },
            notificationData
          );
          return data;
        } catch (error) {
          console.error("Error sending push notifications:", error);
        }
      }

    async createRequestAdditionalInformation(userId, input: RequestAdditionalInformationInput, authorization) {
        const additionalInformation = await this.RequestAdditionalInformationModel.create({ ...input, userId });

        if (input.isPtsiApproval) {
            await this.DiligenceReportModel.update({
                statusLegends: STATUS_LEGENDS.UPDATE_REQUIRED
            }, {
                where: { id: input.dueDiligenceReportId }
            });

            // send email to supplier with additional information
            await this.sendEmailForUpdateRequired(input.supplierId, userId, {
                dueDiligenceReportId: input.dueDiligenceReportId,
                description: input.description,
                shareAccess: input.shareAccess,
                selectedStep: input.selectedStep
            });
        }
        
        await this.sendPushNotificationToUsers(
            "ddr_additional_information",
            input.dueDiligenceReportId,
            [input.cfUserId],
            authorization,
            additionalInformation
        );
    }

    async addSupplier(userId, organizationId, input: SupplierDataInput) {

        if (!input.email) {
            throw new HttpException(`Email doesn't exists`, 400);
        }

        const userExist: any = await this.userService.findOneByEmail(input.email);

        if (userExist) {
            throw new HttpException(`User already exsist`, 400);
        }


        let nameParts = input.fullName.trim().split(' ');
        let firstName = nameParts[0] || "";
        let lastName = nameParts[nameParts.length - 1] || "";

        const userInfo: any = {
            role: 'supplier',
            email: input.email,
            firstName: firstName,
            lastName: lastName,
            countryId: input.countryId,
            mobile: input.mobile,
            organization:organizationId
        }

        const user: any = await this.userService.create(userInfo);
        return user;

    }


    async sendEmailForUpdateRequired(supplierId: number, userId: number, additionalInfo?: any) {
        try {
            const supplier: any = await this.userService.findOne(supplierId);

            let orgRes = await this.OrgModel.findOne({ where: { id: supplier.organization } });
            if (!supplier) {
                throw new HttpException(`supplier not exist`, 400);
            }

            const fullName = `${supplier.firstName} ${supplier.lastName}`.trim();
            const { email: userEmail } = supplier;

            const frontendBaseUrl = process.env.FRONTEND_URL || "https://cfadmin.dimitra.dev";
            
            // Create report access link
            const reportLink = `${frontendBaseUrl}/deforestation/create-due-diligence-reports/${additionalInfo?.dueDiligenceReportId || ''}/show`;

            // Determine access level message
            const shareCompleteReport = additionalInfo?.shareAccess === 'shareCompleteReport';
            const description = additionalInfo?.description || 'Additional information is required for your due diligence report.';

            // Generate base64 images
            const ptsiLogoBase64 = this.getBase64Image('ptsi-logo.png');
            const dimitraLogoBase64 = this.getBase64Image('dimitra-logo.png');

            const emailParams: emailParams = {
                toEmail: userEmail,
                subject: "Due Diligence Report Update Required - Dimitra",
                contentParams: {
                    fullName: fullName,
                    description: description,
                    reportLink: reportLink,
                    supportEmailAddress: "support@dimitra.io",
                    orgName: orgRes?.name || 'Your Organization',
                    shareCompleteReport: shareCompleteReport,
                    currentDate: new Date().toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }),
                    dueDiligenceReportId: additionalInfo?.dueDiligenceReportId || 'N/A',
                    ptsiLogoBase64: ptsiLogoBase64,
                    dimitraLogoBase64: dimitraLogoBase64
                }
            };

            await this.mailService.sendEmail('UpdateRequired', emailParams);

        } catch (error) {
            Logger.log('Error sending update required email:', error);
            throw error;
        }
    }

    private getBase64Image(imageName: string): string {
        try {
            let imagePath: string;
            
            // Map image names to actual file paths
            switch (imageName) {
                case 'ptsi-logo.png':
                    imagePath = path.join(process.cwd(), 'src', 'assets', 'images', 'ptsi-logo.png');
                    break;
                case 'dimitra-logo.png':
                    imagePath = path.join(process.cwd(), 'src', 'assets', 'images', 'dimitra-logo.png');
                    break;
                default:
                    Logger.warn(`Unknown image name: ${imageName}`);
                    return '';
            }

            // Check if file exists
            if (!fs.existsSync(imagePath)) {
                Logger.warn(`Image file not found: ${imagePath}`);
                return '';
            }

            // Read file and convert to base64
            const imageBuffer = fs.readFileSync(imagePath);
            const base64String = imageBuffer.toString('base64');
            
            // Return data URL format
            return `data:image/png;base64,${base64String}`;
        } catch (error) {
            Logger.error(`Error generating base64 for image ${imageName}:`, error);
            return '';
        }
    }

    async sendEmailToSupplier(supplierId:number, userId:number) {
       try {
        const supplier: any = await this.userService.findOne(supplierId);

        let orgRes = await this.OrgModel.findOne({ where:{id  : supplier.organization}});
        if (!supplier) {
            throw new HttpException(`supplier not exsist`, 400);
        }

        const fullName = `${supplier.firstName} ${supplier.lastName}`.trim();
        const { email: userEmail } = supplier;

        const frontendBaseUrl = process.env.FRONTEND_URL || "https://cfadmin.dimitra.dev";

        const signUpLink = `${frontendBaseUrl}/eudr-invitation-signup?inviterId=${encodeURIComponent(userId)}&inviteeId=${encodeURIComponent(supplier.cf_userid)}`;

        const emailParams: emailParams = {
            toEmail: userEmail,
            subject: "You're Invited to Join as a Supplier on Dimitra",
            contentParams: {
                fullName: fullName,
                signUpLink: signUpLink,
                supportEmailAddress: "support@dimitra.io",
                orgName: orgRes.name
            }
        };

        await this.mailService.sendEmail('InviteSupplier', emailParams);

       } catch (error) {
        Logger.log('Error sending email:', error);
        throw error;
       }
    }

    async sendEmailToOperator(operatorId:number, userId:number) {
        try {
         const operator: any = await this.userService.findOne(operatorId);

         let orgRes = await this.OrgModel.findOne({ where:{id  : operator.organization}});
 
         if (!operator) {
             throw new HttpException(`Operator not exsist`, 400);
         }
 
         const fullName = `${operator.firstName} ${operator.lastName}`.trim();
         const { email: userEmail } = operator;

         const frontendBaseUrl = process.env.FRONTEND_URL || "https://cfadmin.dimitra.dev";
 
         const signUpLink = `${frontendBaseUrl}/eudr-invitation-signup?inviterId=${encodeURIComponent(userId)}&inviteeId=${encodeURIComponent(operator.cf_userid)}`;
 
         const emailParams: emailParams = {
             toEmail: userEmail,
             subject: "You're Invited to Join as a Operator on Dimitra",
             contentParams: {
                 fullName: fullName,
                 signUpLink: signUpLink,
                 supportEmailAddress: "support@dimitra.io",
                 orgName: orgRes.name
             }
         };
 
         await this.mailService.sendEmail('InviteOperator', emailParams);
 
        } catch (error) {
         Logger.log('Error sending email:', error);
         throw error;
        }
     }

    /**
     * Check production Places if exists
     */

    async checkProductionPlaceByReportId(reportId):Promise<Object> {
        const result = await this.DiligenceReportProductionPlaceModel.count({
            where:{
                diligenceReportId: reportId
            }
        });
        return {
            count : result
         }
    }

    async updateDueDeligenceStage(reportId:number, stage:number) {
        await this.DiligenceReportModel.update({
            current_step:stage
        }, {
            where: {
                id: reportId
            }
        });
        return {
            message:"stage updated"
        }
    }

    async getDuediligenceReportStage(reportId:number) {
        const report = await this.DiligenceReportModel.findOne({
            where: {
                id: reportId
            }
        });
        return {
            current_step:report.current_step || null
        }
    }

    async sendToOperator(reportId:number) {
        const report = await this.DiligenceReportModel.update({sendToOperator: true},{
            where: {
                id: reportId
            }
        });
        return report
    }

   

    
    async generateComplianceByDiligenceId(diligenceId: string | number) {
        const diligenceReport = await this.DiligenceReportModel.findOne({
            where: { id: diligenceId },
            attributes: ['status'],
        });
        if (diligenceReport) {
            const productionPlaces = await this.DiligenceReportProductionPlaceModel.findAll({
                where: {
                    diligenceReportId: diligenceId,
                    removed: false,
                },
                include: [
                    {
                        model: ProductionPlaceDeforestationInfo,
                        required: true,
                        where: {
                            deforestationStatus: { [Op.ne]: null },
                        },
                    },
                ],
            });

            if (productionPlaces.length === 0) {
                await this.DiligenceReportModel.update({
                    status: 'Ready to Proceed',
                }, { where: { id: diligenceId } });
                return null;
            }
        }
        await this.DiligenceReportModel.update({
            status: 'Writing to Blockchain',
        }, { where: { id: diligenceId } });
        return this.jobService.create({
            modelId: diligenceId.toString(),
            modelType: 'DiligenceReport',
            payload: {
                module: 'DILIGENCE_REPORT',
                command: 'GENERATE_COMPLIANCE',
                prevStatus: diligenceReport.status,
            },
        });
    }


    async generateComplianceByDiligenceIdForApproval({
        diligenceId,
        isTemporaryApproval
    }) {
        const diligenceReport = await this.DiligenceReportModel.findOne({
            where: { id: diligenceId },
            attributes: ['status'],
        });
        if (diligenceReport) {
            const productionPlaces = await this.DiligenceReportProductionPlaceModel.findAll({
                where: {
                    diligenceReportId: diligenceId,
                    removed: false,
                },
                include: [
                    {
                        model: ProductionPlaceDeforestationInfo,
                        required: true,
                        where: {
                            deforestationStatus: { [Op.ne]: null },
                        },
                    },
                ],
            });

            if (productionPlaces.length === 0) {
                await this.DiligenceReportModel.update({
                    status: 'Ready to Proceed',
                }, { where: { id: diligenceId } });
                return null;
            }
        }
        await this.DiligenceReportModel.update({
            status: 'Writing to Blockchain',
        }, { where: { id: diligenceId } });
        return this.jobService.create({
            modelId: diligenceId.toString(),
            modelType: 'DiligenceReport',
            payload: {
                module: 'DILIGENCE_REPORT',
                command: 'GENERATE_COMPLIANCE',
                prevStatus: diligenceReport.status,
                isTemporaryApproval
            },
        });
    }

    async generateCompliance(job: Job): Promise<void> {
        const dueDiligenceId = job.modelId;
        if (!dueDiligenceId) return;
        if(!job.context) job.context = {};
        if(!job.payload.reportData) {
            const productionPlaces = await this.DiligenceReportProductionPlaceModel.findAll({
                where: {
                    diligenceReportId: dueDiligenceId,
                    removed: false,
                },
                attributes: ['id'],
                include: [
                    {
                        model: ProductionPlaceDeforestationInfo,
                        required: true,
                        where: {
                            deforestationStatus: { [Op.ne]: null },
                        },
                        include: [
                            {
                                model: DeforestationReportRequest,
                                required: true,
                                include: [
                                    {
                                        model: DeforestationReportRequest,
                                        required: false,
                                        as: 'childReports',
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        model: Farm,
                        as: 'farm',
                        where: {
                            isDeleted: 0,
                        },
                        attributes: ['id'],
                        required: true,
                    },
                ],
            });
            if(!productionPlaces.length) {
                job.status = JobStatus.Completed;
                await job.save();
                if(job.status === JobStatus.Completed && job.modelId && job.modelType === 'DiligenceReport') {
                    await this.DiligenceReportModel.update({ status: job.payload.prevStatus ?? 'Ready to Proceed' }, { where: { id: job.modelId } });
                }
                return;
            }
            const deforestationReportsData = productionPlaces.map((productionPlace) => {
              const report = productionPlace.productionPlaceDeforestationInfo.deforestationReport;
              if (!report.farmUUID) report.farmUUID = uuid.v4();
              if (!report.farmerUUID) report.farmerUUID = uuid.v4();
              const blockChainData: IBlockChainData = {
                AssessmentNumber: report.reportGuid,
                ModelVersion: report.modelVersion,
                ReportVersion: report.reportVersion,
                GeometryType: report.geometryType,
                IssueDate: report.issueDate || moment(report.createdAt).format('YYYY-MM-DD'),
                FarmerUUID: report.farmerUUID,
                FarmUUID: report.farmUUID,
                OverallDeforestationProbability: report.originalOverallProb || report.overallProb,
                HashAlgorithm: 'SHA-256',
                GeometryHash:
                  report.geometryType === 'circular'
                    ? report.circularDataSHA256
                    : report.polygonalDataSHA256,
              };
              if (report.childReports?.length) {
                blockChainData.SubReports = report.childReports.map((report) => {
                  if (!report.farmUUID) report.farmUUID = blockChainData.FarmUUID;
                  if (!report.farmerUUID) report.farmerUUID = blockChainData.FarmerUUID;
                  return {
                    AssessmentNumber: report.reportGuid,
                    ModelVersion: report.modelVersion,
                    ReportVersion: report.reportVersion,
                    GeometryType: report.geometryType,
                    IssueDate: report.issueDate || moment(report.createdAt).format('YYYY-MM-DD'),
                    FarmerUUID: report.farmerUUID,
                    FarmUUID: report.farmUUID,
                    OverallDeforestationProbability: report.originalOverallProb || report.overallProb,
                    HashAlgorithm: 'SHA-256',
                    GeometryHash:
                      report.geometryType === 'circular' ? report.circularDataSHA256 : report.polygonalDataSHA256,
                  };
                });
              }
              return blockChainData;
            });
            const lastDiligenceReportTransaction = await this.DiligenceReportTransactionModel.findOne({
                where: { diligenceReportId: dueDiligenceId },
                order: [['createdAt', 'DESC']],
            });
            const s3Data = JSON.stringify(deforestationReportsData);
            const response = await this.s3Service.uploadComplianceData(s3Data, 'json');
            const blockchainData = {
              Key: response.Key,
              Location: response.Location,
              TotalNumberOfFarms: deforestationReportsData.length,
              PreviousTransactionHash: lastDiligenceReportTransaction?.transactionHash,
              DimitraDDSId: dueDiligenceId,
              ComplianceStatus: job.payload.prevStatus,
              SHA256Hash: createHash('sha256').update(s3Data).digest('hex'),
              isTemporaryApproval: job.payload?.isTemporaryApproval || null,
            };
            const contract = await initializeEtherContract();
            const testString = JSON.stringify(blockchainData);
            const expectedHash = utils.keccak256(utils.toUtf8Bytes(testString));

            const gasFeeData = await getFeeData();
            const transactionParameters = {
              gasPrice: gasFeeData.gasPrice,
            };
            const transaction = await contract.mapSerializedReportData(testString, transactionParameters);
            await this.DiligenceReportTransactionModel.create({
                transactionHash: transaction.hash,
                keccakHash: expectedHash,
                s3Key: response.Key,
                diligenceReportId: dueDiligenceId,
            });
            const updatedReportData = productionPlaces.map((place) => {
              return {
                id: place.productionPlaceDeforestationInfo.deforestationReportRequestId,
                transactionHash: transaction.hash,
                keccakHash: expectedHash,
                isCertificateReady: true,
                status: ReportStatus.CERTIFICATE_READY,
                farmUUID: place.productionPlaceDeforestationInfo.deforestationReport.farmUUID,
                farmerUUID: place.productionPlaceDeforestationInfo.deforestationReport.farmerUUID,
                isCertified: true,
              };
            });
            const batches = [];
            const BATCH_SIZE = 50;
            const maxLength = updatedReportData.length;
            for(let i = 0; i < maxLength; i += BATCH_SIZE) {
                const batchData = updatedReportData.slice(i, i + BATCH_SIZE);
                batches.push(batchData);
            }
            job.payload = { ...job.payload, batches: batches };
            job.context = {
                blockchainData,
                keccakHash: expectedHash,
                transactionHash: transaction.hash
            };
            await job.save();
        }

        const batches = job.payload.batches;
        const maxBatch = batches.length;
        for(let i = job.context.completedCount || 0; i < maxBatch; i++) {
            await Promise.all(batches[i].map(report => this.DeforestationReportRequestModel.update({
                ...report,
            }, { where: { id: report.id } })));
            job.context = { ...job.context, completedCount: (job.context.completedCount || 0) + 1 };
            const isLastBatch = i === maxBatch - 1;
            job.status = isLastBatch ? JobStatus.Completed : this.shouldPause ? JobStatus.Pending : JobStatus.Processing;
            await job.save();
            if(this.shouldPause) break;
        }
        if(job.status === JobStatus.Completed && job.modelId && job.modelType === 'DiligenceReport') {
            await this.DiligenceReportModel.update({ status: job.payload.prevStatus ?? 'Ready to Proceed', is_report_concluded:1 }, { where: { id: job.modelId } });
        }
    }

    async runJob(job: Job): Promise<Job> {
        try {
            this.initRun(job);
            const command = job.payload.command;
            if(typeof command !== 'string') return;
            switch(command) {
                case 'GENERATE_COMPLIANCE':
                    await this.generateCompliance(job);
                    break;
                default:
                    break;
            }
            this.markJobAsComplete(job);
            return job;
        } catch (error) {
            this.removeJob(job);
            if(job.modelId && job.modelType === 'DiligenceReport') {
                await this.DiligenceReportModel.update({ status: job.payload.prevStatus ?? 'Ready to Proceed' }, { where: { id: job.modelId } });
            }
            throw error;
        }
    }

    async getRequestAdditionalInformationById(id: number) {
        return await this.RequestAdditionalInformationModel.findOne({
            where: { id },
        });
    }
    
    async updateGeolocationPrivacy(isGeolocationPrivate: boolean, diligenceReportId: number) {
       
        await this.DiligenceReportModel.update({
            isGeolocationPrivate
        }, {
            where: {
                id:diligenceReportId
            }
        });
    }
    async getAllRequestAdditionalInformationByDiligenceId(dueDiligenceReportId: number) {
        const where: any = {
            dueDiligenceReportId,
        };
        const results = await this.RequestAdditionalInformationModel.findAll({
            where,
            order: [
                ['id', 'DESC']
            ],
        });
    
        // Return empty array if no results found (this is a valid case)
        return results || [];
    }

    /**
     * Remove all request additional information for a concluded diligence report
     * @param dueDiligenceReportId - The ID of the diligence report
     * @returns Promise with deletion result
     */
    async removeRequestAdditionalInformationByDiligenceId(dueDiligenceReportId: number) {
        try {
            const report = await this.DiligenceReportModel.findOne({
                where: {
                    id: dueDiligenceReportId,
                    isDeleted: 0
                },
                attributes: ['id', 'status', 'is_report_concluded']
            });

            if (!report) {
                throw new HttpException(`Diligence report with ID ${dueDiligenceReportId} not found`, 404);
            }

            const isConcluded = report.is_report_concluded || 
                               ['Compliant', 'Non-Compliant'].includes(report.status);

            if (!isConcluded) {
                throw new HttpException(`Diligence report with ID ${dueDiligenceReportId} is not concluded yet`, 400);
            }

            const deletedCount = await this.RequestAdditionalInformationModel.destroy({
                where: {
                    dueDiligenceReportId: dueDiligenceReportId
                }
            });

            return {
                success: true,
                message: `Successfully removed ${deletedCount} request additional information records`,
                deletedCount
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(`Failed to remove request additional information: ${error.message}`, 500);
        }
    }

    /**
     * 
     * @param exporterId  must be a valid saas API user id so we equvalient 
     * @param diligenceReportId 
     * @param userId 
     * @returns 
     */
    async assignDDSExporterToReport(
    diligenceReportId: number,
    exporterId: number,
    userId: number,
    isSaasExporterId = true
    ) {
        if (!exporterId) {
            return null;
        }

        const user = await this.userService.findOne(userId);

        // Resolve actual exporter ID
        const resolvedExporterId = isSaasExporterId
            ? (await this.userService.findByCfID(exporterId))?.id
            : exporterId;

        if (!resolvedExporterId) {
            return null;
        }

        // Check for existing association
        const existingEntry = await this.DdsReportExporterModel.findOne({
            where: { diligence_report_id: diligenceReportId },
        });

        if (existingEntry) {
            existingEntry.exporter_id = resolvedExporterId;
            existingEntry.shared_by = userId;
            await existingEntry.save();
            return existingEntry;
        }

        // Create new entry
        return await this.DdsReportExporterModel.create({
            diligence_report_id: diligenceReportId,
            exporter_id: resolvedExporterId,
            exporter_cf_id: isSaasExporterId ? exporterId : null,
            shared_by: userId,
            shared_by_cf_id: user?.cf_userid
        });
    }

    async attachOperator(
        userId: number,
        diligenceReportInput: ShareReportOperatorInput
    ): Promise<DiligenceReport> {       
        const diligenceReport = await this.DiligenceReportModel.findOne({
            where: {
                id: diligenceReportInput.diligenceReportId      
            }
        });
        if (!diligenceReport) {
            throw new HttpException(`Diligence report not found`, 404);
        }
        diligenceReport.operatorId = `${diligenceReportInput.operatorId}`;
        diligenceReport.sendToOperator = true
        diligenceReport.whoAddPlaceData = 'operator'
        await diligenceReport.save();
        await this.sendEmailToOperator(diligenceReportInput.operatorId, userId)
        return diligenceReport
    }

    /**
     * Bulk assign reports to a user
     */
    async bulkAssignReports(reportIds: number[], assignedTo: number, assignedToCfId: number) {
        const transaction = await this.sequelize.transaction();
        const failedReportIds: number[] = [];
        let processedCount = 0;

        try {
            for (const reportId of reportIds) {
                try {
                    const report = await this.DiligenceReportModel.findByPk(reportId);
                    if (!report) {
                        failedReportIds.push(reportId);
                        continue;
                    }

                    await report.update({
                        assignedTo: assignedTo,
                        assignedToCfId: assignedToCfId,
                        assignedDate: new Date(),
                        statusLegends: STATUS_LEGENDS.PENDING_APPROVAL,
                        temporaryExpirationDate: null,
                        temporaryExpirationValue: null,
                        temporaryExpirationUnit: null,
                        isTemporaryApproval: false,
                        rejectionReason: null,
                        
                    }, { transaction });

                
                    processedCount++;
                } catch (error) {
                    failedReportIds.push(reportId);
                    console.error(`Failed to assign report ${reportId}:`, error);
                }
            }

            await transaction.commit();

            return {
                success: failedReportIds.length === 0,
                message: `Successfully assigned ${processedCount} reports${failedReportIds.length > 0 ? `, ${failedReportIds.length} failed` : ''}`,
                processedCount,
                failedReportIds: failedReportIds.length > 0 ? failedReportIds : undefined
            };
        } catch (error) {
            await transaction.rollback();
            throw new HttpException(`Bulk assign operation failed: ${error.message}`, 500);
        }
    }

    /**
     * Update production places status during temporary approval period
     */
    private async updateProductionPlacesForTemporaryApproval(
        reportId: number, 
        isTemporaryApproval: any
    ) {
        try {
            // Get all production places for this report
            const productionPlaces = await this.DiligenceReportProductionPlaceModel.findAll({
            where: {
                diligenceReportId: reportId,
                removed: false
            },
            include: [
                {
                model: this.DueDiligenceProductionPlaceModel,
                as: 'productionPlace'
                },
                {
                model: this.ProductionPlaceDeforestationInfoModel,
                as: 'productionPlaceDeforestationInfo'
                }
            ]
            });
            // Run updates in parallel
            await Promise.all(
            productionPlaces.map(async (reportProductionPlace) => {
                const productionPlace = reportProductionPlace.productionPlace;

                if (productionPlace && reportProductionPlace.productionPlaceDeforestationInfoId) {
                const originalDeforestationStatus =
                    reportProductionPlace.productionPlaceDeforestationInfo?.deforestationStatus;
                    if(isTemporaryApproval && (originalDeforestationStatus !== 'Zero/Negligible Deforestation Probability')){
                        return this.ProductionPlaceDeforestationInfoModel.update({
                            deforestationStatus: 'Manually Mitigated',
                            lastDeforestationMitigationDate: new Date(),
                            originalDeforestationStatusForTemporaryApproval: originalDeforestationStatus
                        }, {
                            where: { id: reportProductionPlace.productionPlaceDeforestationInfoId }
                        }); 
                    }    
                }
                return null; // no update needed
            })
            );

            Logger.log('Production places updated for temporary approval');
        } catch (error) {
            console.error('Error updating production places for temporary approval:', error);
            throw error;
        }
        }


    /**
     * Bulk approve reports
     */
    async bulkApproveReports(
        reportIds: number[], 
        isTemporaryApproval = false,
        approvalExpirationValue?: number,
        approvalExpirationUnit?: string
    ) {
        const transaction  = await this.sequelize.transaction();
        const failedReportIds: number[] = [];
        const jobsOutput = [];
        let processedCount = 0;
        try {
            for (const reportId of reportIds) {
                try {
                    const report = await this.DiligenceReportModel.findByPk(reportId);
                    if (!report) {
                        failedReportIds.push(reportId);
                        continue;
                    }

                    const currentDate = new Date();
                    report.statusLegends = isTemporaryApproval ? STATUS_LEGENDS.TEMPORARY_APPROVED : STATUS_LEGENDS.APPROVED;
                    report.isTemporaryApproval = isTemporaryApproval;
                    report.approvedDate = currentDate;

                    

                    // Calculate processing time if report was assigned
                    if (report.assignedDate) {
                        const processingTimeMs = currentDate.getTime() - new Date(report.assignedDate).getTime();
                        const processingTimeInDays = Math.ceil(processingTimeMs / (1000 * 60 * 60 * 24));
                        report.processingTimeInDays = processingTimeInDays;
                    }

                    if (isTemporaryApproval) {
                        const expirationValue = approvalExpirationValue || 26;
                        const expirationUnit = approvalExpirationUnit || 'days';
                        
                        // Calculate expiration date based on input values
                        let expirationDate = new Date(currentDate);
                        switch (expirationUnit) {
                            case 'days':
                                expirationDate.setDate(currentDate.getDate() + expirationValue);
                                break;
                            case 'months':
                                expirationDate.setMonth(currentDate.getMonth() + expirationValue);
                                break;
                            case 'years':
                                expirationDate.setFullYear(currentDate.getFullYear() + expirationValue);
                                break;
                            default:
                                expirationDate.setDate(currentDate.getDate() + expirationValue);
                        }
                        
                        
                        
                        // Update production places status during temporary approval
                        if(isTemporaryApproval){
                            await this.updateProductionPlacesForTemporaryApproval(reportId, isTemporaryApproval);
                        }
                        report.temporaryExpirationDate = expirationDate;
                        report.temporaryExpirationValue = expirationValue;
                        report.temporaryExpirationUnit = expirationUnit;
                        report.assignedTo = null;
                        report.assignedToCfId = null;
                        report.assignedDate = null;
                        report.rejectionReason = null;
                    }
                    await report.save();
                    processedCount++;

                    const job = await this.generateComplianceByDiligenceIdForApproval({
                        diligenceId: reportId,
                        isTemporaryApproval
                    });
                    jobsOutput.push(job);
                } catch (error) {
                    failedReportIds.push(reportId);
                    console.error(`Failed to approve report ${reportId}:`, error);
                }
            }
        return {
            jobs:(jobsOutput || []).filter(j => j != null),
            success:true
        }
        } catch (error) {
            //await transaction.rollback();
            throw new HttpException(`Bulk approve operation failed: ${error.message}`, 500);
        }

        
    }

    /**
     * Bulk reject reports
     */
    async bulkRejectReports(reportIds: number[], reason: string) {
        const transaction = await this.sequelize.transaction();
        const failedReportIds: number[] = [];
        let processedCount = 0;

        try {
            for (const reportId of reportIds) {
                try {
                    const report = await this.DiligenceReportModel.findByPk(reportId);
                    if (!report) {
                        failedReportIds.push(reportId);
                        continue;
                    }

                    await report.update({
                        statusLegends: STATUS_LEGENDS.REJECTED,
                        rejectionReason: reason,
                        assignedTo: null,
                        assignedToCfId: null,
                        assignedDate: null,
                        temporaryExpirationDate: null,
                        temporaryExpirationValue: null,
                        temporaryExpirationUnit: null,
                        isTemporaryApproval: false,
                    }, { transaction });
                    
                    processedCount++;
                } catch (error) {
                    failedReportIds.push(reportId);
                    console.error(`Failed to reject report ${reportId}:`, error);
                }
            }

            await transaction.commit();

            return {
                success: failedReportIds.length === 0,
                message: `Successfully rejected ${processedCount} reports${failedReportIds.length > 0 ? `, ${failedReportIds.length} failed` : ''}`,
                processedCount,
                failedReportIds: failedReportIds.length > 0 ? failedReportIds : undefined
            };
        } catch (error) {
            await transaction.rollback();
            throw new HttpException(`Bulk reject operation failed: ${error.message}`, 500);
        }
    }

    /**
     * Check and update report status based on approval flow settings
     * @param reports - Array of diligence reports to check
     * @param organizationId - Organization ID to get approval settings for
     */
    private async checkAndUpdateOverdueReports(reports: any[], organizationId: number): Promise<void> {
        try {
            const reportsToUpdate: any[] = [];

            // Check each report for overdue status
            for (const report of reports) {
                if (report.createdAt && 
                    report.statusLegends !== STATUS_LEGENDS.APPROVED &&
                    report.statusLegends !== STATUS_LEGENDS.REJECTED) {
                    
                    const isOverdue = await this.approvalFlowSettingsService.isReportOverdue(
                        report.createdAt, 
                        organizationId
                    );

                    if (isOverdue !== null) {
                        if (isOverdue) {
                            reportsToUpdate.push({
                                id: report.id,
                                statusLegends: STATUS_LEGENDS.OVERDUE
                            });
                        } else if (report.statusLegends === STATUS_LEGENDS.OVERDUE) {
                            reportsToUpdate.push({
                                id: report.id,
                                statusLegends: STATUS_LEGENDS.PENDING_NEWLY_RECEIVED
                            });
                        }
                    }
                }
            }

            // Bulk update overdue reports
            if (reportsToUpdate.length > 0) {
                const transaction = await this.sequelize.transaction();
                try {
                    for (const updateData of reportsToUpdate) {
                        await this.DiligenceReportModel.update(
                            { statusLegends: updateData.statusLegends },
                            { 
                                where: { id: updateData.id },
                                transaction 
                            }
                        );
                    }
                    await transaction.commit();
                    
                    for (const report of reports) {
                        const updatedReport = reportsToUpdate.find(r => r.id === report.id);
                        if (updatedReport) {
                            report.statusLegends = updatedReport.statusLegends;
                        }
                    }
                } catch (error) {
                    await transaction.rollback();
                    console.error('Failed to update overdue reports:', error);
                }
            }
        } catch (error) {
            console.error('Error checking overdue reports:', error);
        }
    }



    /**
     * Get reports filtered by date only
     * @param dateFilter - Date filter option
     * @param organizationId - Organization ID
     * @param userId - User ID
     * @param subOrganizationId - Sub organization ID
     * @param startDate - Optional start date for custom date range
     * @param endDate - Optional end date for custom date range
     * @param productId - Optional product ID filter (2, 3, 5)
     * @param context - Optional execution context for permission checking
     * @returns Promise with status legend counts
     */
    async getReportsByDateFilter(
        dateFilter: string,
        organizationId: number,
        userId: number,
        subOrganizationId: number | null,
        startDate?: string,
        endDate?: string,
        productId?: number,
        context?: ExecutionContext
    ): Promise<DiligenceReportStatusSummary[]> {
        try {
            let where: any = {
                isDeleted: 0,
                organizationId: organizationId,
            };

            if (subOrganizationId) {
                where.subOrganizationId = subOrganizationId;
            }

            /**
             * only for indonesia_ptsi_worker
             */
            if (context && await this.permissionService.checkPermission(PERMISSIONS.worker.value, context)) {
                where = this.removeOrganizationSubOrgKeys(where, false);
                where.assignedTo = userId;
                where.statusLegends = {
                    [Op.notIn]: ['Approved']
                };
            }

            // Apply date filtering
            const now = new Date();
            let filterStartDate: Date;
            let filterEndDate: Date;

            if (startDate && endDate) {
                filterStartDate = new Date(startDate);
                filterEndDate = new Date(endDate);
                // Set end date to end of day
                filterEndDate.setHours(23, 59, 59, 999);
            } else if (dateFilter && dateFilter !== 'all') {
                switch (dateFilter.toLowerCase()) {
                    case 'today':
                        filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                        break;
                    case 'week':
                        filterStartDate = new Date(now);
                        filterStartDate.setDate(now.getDate() - 7);
                        filterEndDate = new Date(now);
                        break;
                    case 'month':
                        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                        break;
                    case 'year':
                        filterStartDate = new Date(now.getFullYear(), 0, 1);
                        filterEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                        break;
                    default:
                        // For any other value, don't apply date filtering
                        filterStartDate = null;
                        filterEndDate = null;
                }
            } else {
                filterStartDate = null;
                filterEndDate = null;
            }

            if (filterStartDate && filterEndDate) {
                where.createdAt = {
                    [Op.gte]: filterStartDate,
                    [Op.lte]: filterEndDate
                };
            }

            // Get count by status legend using simple Sequelize query
            const statusCounts = await this.DiligenceReportModel.findAll({
                where,
                attributes: [
                    'statusLegends',
                    [this.sequelize.fn('COUNT', this.sequelize.col('DiligenceReport.id')), 'count']
                ],
                include: productId ? [{
                    model: ManageProduct,
                    required: true,
                    as: 'product_detail',
                    attributes: ['id', 'name'],
                    where: {
                        id: productId
                    }
                }] : [],
                group: ['statusLegends'],
                raw: true
            });

            // Calculate total count
            const totalCount = statusCounts.reduce((sum, item: any) => sum + parseInt(item.count), 0);

            // Map to summary format with percentages
            const summary = statusCounts.map((item: any) => {
                const count = parseInt(item.count);
                const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
                
                return {
                    statusLegend: item.statusLegends || 'Unknown',
                    count: count,
                    percentage: Math.round(percentage * 100) / 100 // Round to 2 decimal places
                };
            });

            return summary;
        } catch (error) {
            console.error('Error getting reports by date filter:', error);
            throw new HttpException(`Failed to get reports by date filter: ${error.message}`, 500);
        }
    }

    /**
     * Get reports count by specific products (Cocoa, Coffee, Rubber) filtered by date
     * @param dateFilter - Date filter option
     * @param organizationId - Organization ID
     * @param userId - User ID
     * @param subOrganizationId - Sub organization ID
     * @param startDate - Optional start date for custom date range
     * @param endDate - Optional end date for custom date range
     * @param productId - Optional product ID filter (2, 3, 5)
     * @param context - Optional execution context for permission checking
     * @returns Promise with product counts for Cocoa (ID: 2), Coffee (ID: 3), and Rubber (ID: 5)
     */
    async getReportsByProductAndDate(
        dateFilter: string,
        organizationId: number,
        userId: number,
        subOrganizationId: number | null,
        startDate?: string,
        endDate?: string,
        productId?: number,
        context?: ExecutionContext
    ): Promise<DiligenceReportProductSummary[]> {
        try {
            let where: any = {
                isDeleted: 0,
                organizationId: organizationId,
            };

            if (subOrganizationId) {
                where.subOrganizationId = subOrganizationId;
            }

            /**
             * only for indonesia_ptsi_worker
             */
            if (context && await this.permissionService.checkPermission(PERMISSIONS.worker.value, context)) {
                where = this.removeOrganizationSubOrgKeys(where, false);
                where.assignedTo = userId;
                where.statusLegends = {
                    [Op.notIn]: ['Approved']
                };
            }

            // Apply date filtering
            const now = new Date();
            let filterStartDate: Date;
            let filterEndDate: Date;

            if (startDate && endDate) {
                filterStartDate = new Date(startDate);
                filterEndDate = new Date(endDate);
                filterEndDate.setHours(23, 59, 59, 999);
            } else if (dateFilter && dateFilter !== 'all') {
                switch (dateFilter.toLowerCase()) {
                    case 'today':
                        filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                        break;
                    case 'week':
                        filterStartDate = new Date(now);
                        filterStartDate.setDate(now.getDate() - 7);
                        filterEndDate = new Date(now);
                        break;
                    case 'month':
                        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                        break;
                    case 'year':
                        filterStartDate = new Date(now.getFullYear(), 0, 1);
                        filterEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                        break;
                    default:
                        // For any other value, don't apply date filtering
                        filterStartDate = null;
                        filterEndDate = null;
                }
            } else {
                // No date filtering for 'all' or when no dateFilter is provided
                filterStartDate = null;
                filterEndDate = null;
            }

            if (filterStartDate && filterEndDate) {
                where.createdAt = {
                    [Op.gte]: filterStartDate,
                    [Op.lte]: filterEndDate
                };
            }

            // Get count by specific products only (Cocoa: 2, Coffee: 3, Rubber: 5)
            const productCounts = await this.DiligenceReportModel.findAll({
                where,
                attributes: [
                    [this.sequelize.fn('COUNT', this.sequelize.col('DiligenceReport.id')), 'count']
                ],
                include: [
                    {
                        model: ManageProduct,
                        required: true,
                        as: 'product_detail',
                        attributes: ['id', 'name'],
                        where: {
                            id: productId ? [productId] : DiligenceReportService.STATIC_PRODUCT_IDS
                        }
                    }
                ],
                group: ['product_detail.id', 'product_detail.name'],
                raw: true
            });

            // Map to summary format
            const summary = productCounts.map((item: any) => {
                return {
                    productName: item['product_detail.name'] || 'Unknown',
                    count: parseInt(item.count)
                };
            });

        
            return summary;
        } catch (error) {
            console.error('Error getting reports by product and date:', error);
            throw new HttpException(`Failed to get reports by product and date: ${error.message}`, 500);
        }
    }
    
    async getDdsReportSubmissionCounts(input: DdsReportSubmissionCountInput, currentUserId?: number, context?: ExecutionContext): Promise<DdsReportSubmissionCount> {
        const { year, organizationId, subOrganizationId, products } = input;
        
        // Use provided products or default to static product IDs [2,3,5] (Cocoa, Coffee, Rubber)
        const productIds = products && products.length > 0 ? products : DiligenceReportService.STATIC_PRODUCT_IDS;
        
        // Check if user has worker role using cfRoles - match dashboard statistics pattern
        const isWorkerRole = input.cfRoles && input.cfRoles.some(role => role.includes('indonesia_ptsi_worker') || role.includes('kenya_ptsi_worker'));
        
        // Build WHERE conditions array like dashboard statistics
        const whereConditionParts: string[] = [];
        const replacements: any = {
            startDate: `${input.year}-01-01`,
            endDate: `${input.year + 1}-01-01`,
            productIds: productIds
        };

        // Date filtering
        whereConditionParts.push(`(
            (\`updatedAt\` IS NOT NULL AND \`updatedAt\` >= :startDate AND \`updatedAt\` < :endDate)
            OR 
            (\`updatedAt\` IS NULL AND \`createdAt\` >= :startDate AND \`createdAt\` < :endDate)
        )`);
        
        // Basic filters
        whereConditionParts.push('\`isDeleted\` = 0');
        whereConditionParts.push('\`product\` IN (:productIds)');
        
        // Organization filtering
        if (organizationId) {
            whereConditionParts.push('\`organizationId\` = :organizationId');
            replacements.organizationId = organizationId;
        }
        
        if (subOrganizationId) {
            whereConditionParts.push('\`subOrganizationId\` = :subOrganizationId');
            replacements.subOrganizationId = subOrganizationId;
        }

        // Apply worker filtering logic - match dashboard statistics pattern exactly
        if (isWorkerRole && currentUserId) {
            whereConditionParts.push('\`assignedTo\` = :assignedToUserId');
            replacements.assignedToUserId = currentUserId;
            // Exclude approved status legends for workers only
            whereConditionParts.push('\`statusLegends\` != :approvedStatus');
            replacements.approvedStatus = 'Approved';
        }
        
        const whereClause = whereConditionParts.join(' AND ');

        const monthlyCounts = await this.sequelize.query(`
            SELECT 
                EXTRACT(MONTH FROM CASE 
                    WHEN \`updatedAt\` IS NOT NULL THEN \`updatedAt\` 
                    ELSE \`createdAt\` 
                END) as month,
                \`statusLegends\`,
                COUNT(*) as count
            FROM \`diligence_reports\` 
            WHERE ${whereClause}
            GROUP BY 
                EXTRACT(MONTH FROM CASE 
                    WHEN \`updatedAt\` IS NOT NULL THEN \`updatedAt\` 
                    ELSE \`createdAt\` 
                END), 
                \`statusLegends\`
            ORDER BY month ASC
        `, {
            replacements,
            type: QueryTypes.SELECT
        }) as any[];
        
        const statusTotals: { [key: string]: number } = {};
        
        monthlyCounts.forEach((item: any) => {
            const status = item.statusLegends;
            const count = parseInt(item.count);
            statusTotals[status] = (statusTotals[status] || 0) + count;
        });
        
        const statusCounts = Object.entries(statusTotals).map(([status, count]) => ({
            status: status as any,
            count
        }));
        
        const totalCount = statusCounts.reduce((sum, item) => sum + item.count, 0);
        
        const monthNames = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];
        
        const yearSuffix = input.year.toString().slice(-2);
        
        const monthlyData: { [key: string]: any } = {};
        
        for (let i = 1; i <= 12; i++) {
            const monthKey = `${monthNames[i-1]}-${yearSuffix}`;
            monthlyData[monthKey] = {
                month: monthKey,
                statusCounts: [
                    { status: 'approved', count: 0 },
                    { status: 'pending', count: 0 },
                    { status: 'overdue', count: 0 },
                    { status: 'rejected', count: 0 }
                ]
            };
        }
        
        monthlyCounts.forEach((item: any) => {
            const month = parseInt(item.month);
            if (isNaN(month) || month < 1 || month > 12) {
                return;
            }
            
            const monthKey = `${monthNames[month-1]}-${yearSuffix}`;
            const statusIndex = monthlyData[monthKey].statusCounts.findIndex(
                (s: any) => s.status === item.statusLegends
            );
            
            if (statusIndex !== -1) {
                monthlyData[monthKey].statusCounts[statusIndex].count = parseInt(item.count);
            }
        });
        
        const monthlyStatusCounts = Object.values(monthlyData);
        
        return {
            totalCount,
            statusCounts,
            monthlyStatusCounts
        };
    }

    private calculateDateRange(filterType?: string): { startDate?: string; endDate?: string } {
        if (!filterType || filterType === 'custom') {
            return {};
        }

        const now = new Date();
        let startDate: Date;
        let endDate: Date = new Date(now);

        switch (filterType) {
            case 'today':
                startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
                break;
            case 'week':
                const dayOfWeek = now.getDay();
                const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Monday as first day
                startDate = new Date(now.getFullYear(), now.getMonth(), diff);
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6);
                endDate.setHours(23, 59, 59);
                break;
            case 'month':
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
                break;
            case 'year':
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
                break;
            case 'all':
                // Return empty object for 'all' - no date filtering will be applied
                return {};
            default:
                return {};
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    private calculatePreviousDateRange(filterType?: string): { startDate?: string; endDate?: string } {
        if (!filterType || filterType === 'custom') {
            return {};
        }

        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (filterType) {
            case 'today':
                // Yesterday
                const yesterday = new Date(now);
                yesterday.setDate(now.getDate() - 1);
                startDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());
                endDate = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate(), 23, 59, 59);
                break;
            case 'week':
                // Previous week
                const dayOfWeek = now.getDay();
                const currentWeekStart = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
                const prevWeekStart = new Date(now.getFullYear(), now.getMonth(), currentWeekStart - 7);
                startDate = prevWeekStart;
                endDate = new Date(prevWeekStart);
                endDate.setDate(prevWeekStart.getDate() + 6);
                endDate.setHours(23, 59, 59);
                break;
            case 'month':
                // Previous month
                const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                startDate = prevMonth;
                endDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
                break;
            case 'year':
                // Previous year
                startDate = new Date(now.getFullYear() - 1, 0, 1);
                endDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
                break;
            case 'all':
                // Return empty object for 'all' - no previous period comparison for all data
                return {};
            default:
                return {};
        }

        return {
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
        };
    }

    private calculatePercentageChange(current: number, previous: number): string {
        if (previous === 0) {
            return current > 0 ? '+100%' : '0%';
        }
        const change = ((current - previous) / previous) * 100;
        const sign = change >= 0 ? '+' : '';
        return `${sign}${change.toFixed(1)}%`;
    }

    private async getStatisticsForDateRange(
        input: DashboardStatisticsDto, 
        startDate?: string, 
        endDate?: string,
        currentUserId?: number,
        context?: ExecutionContext
    ): Promise<any> {
        let whereConditions: any = {
            organizationId: input.organizationId,
            isDeleted: 0
        };

        if (input.subOrganizationId) {
            whereConditions.subOrganizationId = input.subOrganizationId;
        }
        if (input.userId) {
            whereConditions.userId = input.userId;
        }
        if (input.products && input.products.length > 0) {
            whereConditions.product = { [Op.in]: input.products };
        }
        if (input.regions && input.regions.length > 0) {
            whereConditions.countryOfProduction = { [Op.overlap]: input.regions };
        }
        if (startDate && endDate) {
            whereConditions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Build WHERE conditions for raw SQL with table aliases
        const whereConditionParts = [];
        const replacements: any = {};
        
        whereConditionParts.push('dr.organizationId = :organizationId');
        replacements.organizationId = input.organizationId;
        
        whereConditionParts.push('dr.isDeleted = 0');
        
        if (input.subOrganizationId) {
            whereConditionParts.push('dr.subOrganizationId = :subOrganizationId');
            replacements.subOrganizationId = input.subOrganizationId;
        }
        if (input.userId) {
            whereConditionParts.push('dr.userId = :userId');
            replacements.userId = input.userId;
        }
        if (input.products && input.products.length > 0) {
            whereConditionParts.push('dr.product IN (:products)');
            replacements.products = input.products;
        }
        if (input.regions && input.regions.length > 0) {
            whereConditionParts.push('dr.countryOfProduction && :regions');
            replacements.regions = input.regions;
        }
        if (startDate && endDate) {
            whereConditionParts.push('dr.createdAt BETWEEN :startDate AND :endDate');
            replacements.startDate = startDate;
            replacements.endDate = endDate;
        }

        // Check if user has worker role using cfRoles
        const isWorkerRole = input.cfRoles && input.cfRoles.some(role => role.includes('indonesia_ptsi_worker') || role.includes('kenya_ptsi_worker'));
        
        // Add worker role filtering: if role is worker, filter by assignedTo field
        if (isWorkerRole && currentUserId) {
            whereConditionParts.push('dr.assignedTo = :assignedToUserId');
            replacements.assignedToUserId = currentUserId;
            // Exclude approved status legends for workers only
            whereConditionParts.push('dr.statusLegends != :approvedStatus');
            replacements.approvedStatus = 'Approved';
        }
        
        const whereClause = whereConditionParts.join(' AND ');

        // Get user IDs from users_dds table that match the stateId if provided
        let userIdsForState: number[] = [];
        if (input.stateId) {
            const stateUsers = await this.sequelize.query(
                `SELECT id FROM users_dds WHERE stateId = :stateId`,
                {
                    replacements: { stateId: input.stateId },
                    type: QueryTypes.SELECT
                }
            );
            userIdsForState = stateUsers.map((user: any) => user.id);
        }

        // Add state-based user filtering to where conditions if stateId is provided
        let finalWhereClause = whereClause;
        if (input.stateId && userIdsForState.length > 0) {
            finalWhereClause += ` AND dr.userId IN (${userIdsForState.join(',')})`;
        } else if (input.stateId && userIdsForState.length === 0) {
            // If stateId is provided but no users found, return zero counts
            finalWhereClause += ` AND dr.userId = -1`;
        }

        // Count reports by status using conditional aggregation in a single query
        // For worker roles, ddsAssignedToMe should count reports assigned to current worker
        // For non-worker roles, ddsAssignedToMe should count unassigned reports
        const assignedToMeCondition = isWorkerRole && currentUserId 
            ? `dr.assignedTo = :assignedToUserId` 
            : `dr.assignedTo IS NULL`;
            
        const statusCounts = await this.sequelize.query(
            `SELECT 
                SUM(CASE WHEN dr.status = 'Non-Compliant' THEN 1 ELSE 0 END) as ddsNonCompliant,
                SUM(CASE WHEN dr.status = 'Compliant' THEN 1 ELSE 0 END) as ddsCompliant,
                SUM(CASE WHEN dr.statusLegends = :approved THEN 1 ELSE 0 END) as ddsApproved,
                SUM(CASE WHEN dr.statusLegends = :overdue THEN 1 ELSE 0 END) as ddsOverdue,
                SUM(CASE WHEN ${assignedToMeCondition} THEN 1 ELSE 0 END) as ddsAssignedToMe
             FROM diligence_reports dr
             WHERE ${finalWhereClause}`,
            {
                replacements: {
                    ...replacements,
                    approved: STATUS_LEGENDS.APPROVED,
                    overdue: STATUS_LEGENDS.OVERDUE
                },
                type: QueryTypes.SELECT
            }
        );

        // Count total farms with organizational and date filters
        // If products are specified, we need to count farms that are associated with those products through diligence reports
        let registeredFarms = 0;
        
        if (input.products && input.products.length > 0) {
            // Count farms that are associated with the specified products through DiligenceReportProductionPlace
            const farmQuery = `
                SELECT COUNT(DISTINCT f.id) as count
                FROM user_farms f
                INNER JOIN diligence_reports_due_diligence_production_places drpp ON f.id = drpp.farmId
                INNER JOIN diligence_reports dr ON drpp.diligenceReportId = dr.id
                WHERE f.isDeleted = 0
                AND dr.isDeleted = 0
                AND dr.organizationId = :organizationId
                ${input.subOrganizationId ? 'AND dr.subOrganizationId = :subOrganizationId' : ''}
                ${input.userId ? 'AND dr.userId = :userId' : ''}
                AND dr.product IN (:products)
                ${input.regions && input.regions.length > 0 ? 'AND dr.countryOfProduction && :regions' : ''}
                ${startDate && endDate ? 'AND f.createdAt BETWEEN :startDate AND :endDate' : ''}
                ${input.stateId && userIdsForState.length > 0 ? `AND f.userId IN (${userIdsForState.join(',')})` : ''}
                ${input.stateId && userIdsForState.length === 0 ? 'AND f.userId = -1' : ''}
            `;
            
            const farmResult = await this.sequelize.query(farmQuery, {
                replacements: {
                    organizationId: input.organizationId,
                    ...(input.subOrganizationId && { subOrganizationId: input.subOrganizationId }),
                    ...(input.userId && { userId: input.userId }),
                    products: input.products,
                    ...(input.regions && input.regions.length > 0 && { regions: input.regions }),
                    ...(startDate && endDate && { startDate, endDate })
                },
                type: QueryTypes.SELECT
            });
            
            registeredFarms = parseInt((farmResult[0] as any).count) || 0;
        } else {
            // Original logic when no product filter is applied
            const farmWhereConditions: any = {
                isDeleted: 0
            };

            if (input.userId) {
                farmWhereConditions.userId = input.userId;
            }
            if (startDate && endDate) {
                farmWhereConditions.createdAt = {
                    [Op.between]: [startDate, endDate]
                };
            }

            // Add state-based user filtering for farms if stateId is provided
            if (input.stateId && userIdsForState.length > 0) {
                farmWhereConditions.userId = {
                    [Op.in]: userIdsForState
                };
            } else if (input.stateId && userIdsForState.length === 0) {
                // If stateId is provided but no users found, return zero count
                farmWhereConditions.userId = -1; // This will return no results
            }
            
            registeredFarms = await this.FarmModel.count({
                where: farmWhereConditions
            });
        }

        let exporterWhereConditions: any = {};
        
        if (startDate && endDate) {
            exporterWhereConditions.createdAt = {
                [Op.between]: [startDate, endDate]
            };
        }

        // Add state-based user filtering for exporters if stateId is provided
        if (input.stateId && userIdsForState.length > 0) {
            exporterWhereConditions.exporter_id = {
                [Op.in]: userIdsForState
            };
        } else if (input.stateId && userIdsForState.length === 0) {
            // If stateId is provided but no users found, return zero count
            exporterWhereConditions.exporter_id = -1;
        }

        let totalExporters = 0;
        if (input.cfRoles.includes("dds_exporter")) {
            // If state filtering is not applied, use the original role-based filtering
            if (!input.stateId) {
                exporterWhereConditions.exporter_id = input.userId || currentUserId;
            }
            totalExporters = await this.DdsReportExporterModel.count({
                distinct: true,
                col: 'exporter_id',
                where: exporterWhereConditions
            });
        } else if (input.cfRoles.includes("operator")) {
            const operatorReports = await this.DiligenceReportModel.findAll({
                where: {
                    operatorId: input.userId || currentUserId,
                    isDeleted: 0
                },
                attributes: ['id']
            });
            const operatorReportIds = operatorReports.map(report => report.id);

            if (operatorReportIds.length > 0) {
                exporterWhereConditions.diligence_report_id = { [Op.in]: operatorReportIds };
                totalExporters = await this.DdsReportExporterModel.count({
                    distinct: true,
                    col: 'exporter_id',
                    where: exporterWhereConditions
                });
            }
        } else {
            totalExporters = await this.DdsReportExporterModel.count({
                distinct: true,
                col: 'exporter_id',
                where: exporterWhereConditions
            });
        }
        
        const activeExporters = totalExporters;

        const counts = statusCounts[0] as any;
        
        return {
            ddsCompliant: parseInt(counts.ddsCompliant) || 0,
            ddsNonCompliant: parseInt(counts.ddsNonCompliant) || 0,
            ddsApproved: parseInt(counts.ddsApproved) || 0,
            ddsOverdue: parseInt(counts.ddsOverdue) || 0,
            ddsAssignedToMe: parseInt(counts.ddsAssignedToMe) || 0,
            registeredFarms,
            activeExporters
        };
    }

    async getDashboardStatistics(input: DashboardStatisticsDto, userId: number, authorization?: string, context?: ExecutionContext): Promise<DashboardStatisticsResponse> {
        // Calculate date range based on filterType if provided
        const calculatedDates = this.calculateDateRange(input.filterType);
        
        // Fix: When filterType is provided, use calculated dates; otherwise use input dates
        let startDate: string | undefined;
        let endDate: string | undefined;
        
        if (input.filterType && input.filterType !== 'custom' && calculatedDates.startDate && calculatedDates.endDate) {
            // Use calculated dates when filterType is specified (today, week, month, year)
            startDate = calculatedDates.startDate;
            endDate = calculatedDates.endDate;
        } else {
            // Use input dates for custom filter or when no filterType is provided
            startDate = input.startDate;
            endDate = input.endDate;
        }
        
        // Use only frontend products for filtering (same as diligence reports)
        const inputWithProductFilter = {
            ...input,
            products: input.products
        };
        
        // Get current period statistics
        const currentStats = await this.getStatisticsForDateRange(inputWithProductFilter, startDate, endDate, userId, context);
        
        // Get previous period statistics for comparison (only if filterType is provided)
        let previousStats: any = null;
        if (input.filterType && input.filterType !== 'custom') {
            const previousDates = this.calculatePreviousDateRange(input.filterType);
            if (previousDates.startDate && previousDates.endDate) {
                previousStats = await this.getStatisticsForDateRange(inputWithProductFilter, previousDates.startDate, previousDates.endDate, userId, context);
            }
        }
        
        // Get Active Cooperatives count for current period
        const activeCooperativesCount = await this.getCooperativesCountForDateRange(
            inputWithProductFilter, 
            startDate, 
            endDate, 
            authorization
        );
        
        // Get Active Exporters count for current period
        const activeExportersCount = await this.getExportersCountForDateRange(
            inputWithProductFilter,
            startDate,
            endDate,
            authorization
        );
        
        // Get Active Cooperatives count for previous period (for percentage calculation)
        let previousActiveCooperativesCount = 0;
        let previousActiveExportersCount = 0;
        if (input.filterType && input.filterType !== 'custom') {
            const previousDates = this.calculatePreviousDateRange(input.filterType);
            if (previousDates.startDate && previousDates.endDate) {
                previousActiveCooperativesCount = await this.getCooperativesCountForDateRange(
                    inputWithProductFilter,
                    previousDates.startDate,
                    previousDates.endDate,
                    authorization
                );
                
                previousActiveExportersCount = await this.getExportersCountForDateRange(
                    inputWithProductFilter,
                    previousDates.startDate,
                    previousDates.endDate,
                    authorization
                );
            }
        }
        
        // Calculate percentage changes
        const response: DashboardStatisticsResponse = {
            ddsCompliant: currentStats.ddsCompliant,
            ddsNonCompliant: currentStats.ddsNonCompliant,
            ddsApproved: currentStats.ddsApproved,
            ddsOverdue: currentStats.ddsOverdue,
            ddsAssignedToMe: currentStats.ddsAssignedToMe,
            registeredFarms: currentStats.registeredFarms,
            activeExporters: activeExportersCount,
            activeCooperatives: activeCooperativesCount
        };
        
        // Add percentage changes if previous period data is available
        if (previousStats) {
            response.ddsCompliantChange = this.calculatePercentageChange(currentStats.ddsCompliant, previousStats.ddsCompliant);
            response.ddsNonCompliantChange = this.calculatePercentageChange(currentStats.ddsNonCompliant, previousStats.ddsNonCompliant);
            response.ddsApprovedChange = this.calculatePercentageChange(currentStats.ddsApproved, previousStats.ddsApproved);
            response.ddsOverdueChange = this.calculatePercentageChange(currentStats.ddsOverdue, previousStats.ddsOverdue);
            response.ddsAssignedToMeChange = this.calculatePercentageChange(currentStats.ddsAssignedToMe, previousStats.ddsAssignedToMe);
            response.registeredFarmsChange = this.calculatePercentageChange(currentStats.registeredFarms, previousStats.registeredFarms);
            response.activeExportersChange = this.calculatePercentageChange(activeExportersCount, previousActiveExportersCount);
            response.activeCooperativesChange = this.calculatePercentageChange(activeCooperativesCount, previousActiveCooperativesCount);
        } else {
            // Default values when no comparison is available
            response.ddsCompliantChange = '0%';
            response.ddsNonCompliantChange = '0%';
            response.ddsApprovedChange = '0%';
            response.activeCooperativesChange = '0%';
            response.ddsOverdueChange = '0%';
            response.ddsAssignedToMeChange = '0%';
            response.registeredFarmsChange = '0%';
            response.activeExportersChange = '0%';
        }

        return response;
    }

    /**
     * Get average processing time by assigned employees filtered by date
     * @param dateFilter - Date filter option
     * @param organizationId - Organization ID
     * @param userId - User ID
     * @param subOrganizationId - Sub organization ID
     * @param startDate - Optional start date for custom date range
     * @param endDate - Optional end date for custom date range
     * @param productId - Optional product ID filter (2, 3, 5)
     * @returns Promise with average processing time by employee
     */
    async getAverageProcessingTimeByEmployee(
        dateFilter: string,
        organizationId: number,
        userId: number,
        subOrganizationId: number | null,
        startDate?: string,
        endDate?: string,
        productId?: number
    ): Promise<AverageProcessingTimeResponse> {
        try {
            let where: any = {
                isDeleted: 0,
                organizationId: organizationId,
                assignedTo: { [Op.ne]: null }, // Only reports that were assigned
                approvedDate: { [Op.ne]: null }, // Only reports that were approved
                processingTimeInDays: { [Op.ne]: null } // Only reports with calculated processing time
            };

            if (subOrganizationId) {
                where.subOrganizationId = subOrganizationId;
            }

            // Apply date filtering
            const now = new Date();
            let filterStartDate: Date;
            let filterEndDate: Date;

            if (startDate && endDate) {
                filterStartDate = new Date(startDate);
                filterEndDate = new Date(endDate);
                // Set end date to end of day
                filterEndDate.setHours(23, 59, 59, 999);
            } else if (dateFilter && dateFilter !== 'all') {
                switch (dateFilter.toLowerCase()) {
                    case 'today':
                        filterStartDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        filterEndDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
                        break;
                    case 'week':
                        filterStartDate = new Date(now);
                        filterStartDate.setDate(now.getDate() - 7);
                        filterEndDate = new Date(now);
                        break;
                    case 'month':
                        filterStartDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        filterEndDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
                        break;
                    case 'year':
                        filterStartDate = new Date(now.getFullYear(), 0, 1);
                        filterEndDate = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
                        break;
                    default:
                        // For any other value, don't apply date filtering
                        filterStartDate = null;
                        filterEndDate = null;
                }
            } else {
                filterStartDate = null;
                filterEndDate = null;
            }

            if (filterStartDate && filterEndDate) {
                where.approvedDate = {
                    [Op.gte]: filterStartDate,
                    [Op.lte]: filterEndDate
                };
            }

            // Get average processing time by assigned user
            const processingTimeData = await this.DiligenceReportModel.findAll({
                where,
                attributes: [
                    'assignedTo',
                    [this.sequelize.fn('AVG', this.sequelize.col('DiligenceReport.processingTimeInDays')), 'averageProcessingTime'],
                    [this.sequelize.fn('COUNT', this.sequelize.col('DiligenceReport.id')), 'totalReports']
                ],
                include: [
                    {
                        model: User,
                        required: true,
                        as: 'assignedToUser',
                        attributes: ['id', 'firstName', 'lastName']
                    },
                    ...(productId ? [{
                        model: ManageProduct,
                        required: true,
                        as: 'product_detail',
                        attributes: ['id', 'name'],
                        where: {
                            id: productId
                        }
                    }] : [])
                ],
                group: ['assignedTo', 'assignedToUser.id', 'assignedToUser.firstName', 'assignedToUser.lastName'],
                order: [[this.sequelize.fn('AVG', this.sequelize.col('DiligenceReport.processingTimeInDays')), 'DESC']],
                raw: true
            });

            // Map to summary format
            const summary = processingTimeData.map((item: any) => {
                const fullName = `${item['assignedToUser.firstName'] || ''} ${item['assignedToUser.lastName'] || ''}`.trim();
                return {
                    employeeName: fullName || 'Unknown Employee',
                    averageProcessingTimeInDays: Math.round(parseFloat(item.averageProcessingTime) * 100) / 100, // Round to 2 decimal places
                    totalReportsProcessed: parseInt(item.totalReports)
                };
            });

            // Calculate overall average processing time
            const totalReports = summary.reduce((sum, item) => sum + item.totalReportsProcessed, 0);
            const weightedAverage = summary.reduce((sum, item) => {
                return sum + (item.averageProcessingTimeInDays * item.totalReportsProcessed);
            }, 0);
            const overallAverage = totalReports > 0 ? Math.round((weightedAverage / totalReports) * 100) / 100 : 0;

            return {
                employees: summary,
                overallAverageProcessingTimeInDays: overallAverage,
                totalReportsProcessed: totalReports
            };
        } catch (error) {
            console.error('Error getting average processing time by employee:', error);
            throw new HttpException(`Failed to get average processing time by employee: ${error.message}`, 500);
        }
    }
}
