import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/sequelize';
import { DiligenceReport } from './entities/diligence-report.entity';
import { DueDiligenceProductionPlace } from '../due-diligence/production-place/entities/production-place.entity';
import { ProductionPlaceDeforestationInfo } from '../due-diligence/production-place/entities/production-place-deforestation-info.entity';
import { DiligenceReportProductionPlace } from './entities/diligence-report-production-place.entity';
import { STATUS_LEGENDS } from '../constants/status-legends.constant';
import { Op } from 'sequelize';

@Injectable()
export class TemporaryApprovalCronService {
    private readonly logger = new Logger(TemporaryApprovalCronService.name);

    constructor(
        @InjectModel(DiligenceReport) private DiligenceReportModel: typeof DiligenceReport,
        @InjectModel(DueDiligenceProductionPlace) private DueDiligenceProductionPlaceModel: typeof DueDiligenceProductionPlace,
        @InjectModel(ProductionPlaceDeforestationInfo) private ProductionPlaceDeforestationInfoModel: typeof ProductionPlaceDeforestationInfo,
        @InjectModel(DiligenceReportProductionPlace) private DiligenceReportProductionPlaceModel: typeof DiligenceReportProductionPlace,
    ) {}

    /**
     * Cron job that runs daily at midnight to check for expired temporary approvals
     * and automatically changes their status to 'Pending Approval' and reverts production places
     */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleExpiredTemporaryApprovals() {
        this.logger.log('Starting expired temporary approval check...');
        
        try {
            const currentDate = new Date();
            
            // Find all reports with temporary approval that have expired
            const expiredReports = await this.DiligenceReportModel.findAll({
                where: {
                    isTemporaryApproval: true,
                    temporaryExpirationDate: {
                        [Op.lte]: currentDate 
                    },
                    statusLegends: STATUS_LEGENDS.TEMPORARY_APPROVED
                },
                attributes: ['id', 'internalReferenceNumber', 'temporaryExpirationDate']
            });

            if (expiredReports.length === 0) {
                this.logger.log('No expired temporary approvals found');
                return;
            }

            this.logger.log(`Found ${expiredReports.length} expired temporary approvals`);

            // Process each expired report to revert production place statuses
            for (const report of expiredReports) {
                await this.revertProductionPlacesForExpiredReport(report.id);
            }

            // Update all expired reports to pending approval
            const reportIds = expiredReports.map(report => report.id);
            
            await this.DiligenceReportModel.update(
                {
                    statusLegends: STATUS_LEGENDS.PENDING_APPROVAL,
                    isTemporaryApproval: false,
                    temporaryExpirationDate: null,
                    temporaryExpirationValue: null,
                    temporaryExpirationUnit: null
                },
                {
                    where: {
                        id: {
                            [Op.in]: reportIds
                        }
                    }
                }
            );

            this.logger.log(`Successfully updated ${expiredReports.length} expired temporary approvals to 'Pending Approval'`);
            
        } catch (error) {
            this.logger.error('Error handling expired temporary approvals:', error);
        }
    }

    /**
     * Revert production places to their original status for an expired report
     */
    private async revertProductionPlacesForExpiredReport(reportId: number) {
        try {
            // Get all production place deforestation info records that have original status stored (indicating temporary approval)
            const deforestationInfoRecords = await this.ProductionPlaceDeforestationInfoModel.findAll({
                where: {
                    originalDeforestationStatusForTemporaryApproval: {
                        [Op.not]: null
                    }
                },
                include: [
                    {
                        model: this.DiligenceReportProductionPlaceModel,
                        as: 'diligenceReportProductionPlaceArray',
                        where: {
                            diligenceReportId: reportId
                        }
                    }
                ]
            });

            for (const deforestationInfo of deforestationInfoRecords) {
                try {
                    // Revert deforestation status to original
                    await this.ProductionPlaceDeforestationInfoModel.update(
                        {
                            deforestationStatus: deforestationInfo.originalDeforestationStatusForTemporaryApproval,
                            originalDeforestationStatusForTemporaryApproval: null
                        },
                        {
                            where: { id: deforestationInfo.id }
                        }
                    );
                    
                    this.logger.log(`Reverted deforestation info ${deforestationInfo.id} to original status: ${deforestationInfo.originalDeforestationStatusForTemporaryApproval}`);
                } catch (updateError) {
                    this.logger.error(`Error reverting deforestation info ${deforestationInfo.id}:`, updateError);
                }
            }
        } catch (error) {
            this.logger.error(`Error reverting production place statuses for report ${reportId}:`, error);
        }
    }



    /**
     * Get count of reports that will expire soon (within next 24 hours)
     * Useful for notifications or dashboard
     */
    async getReportsExpiringSoon() {
        const currentDate = new Date();
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const expiringSoon = await this.DiligenceReportModel.findAll({
            where: {
                isTemporaryApproval: true,
                temporaryExpirationDate: {
                    [Op.between]: [currentDate, tomorrow]
                },
                statusLegends: STATUS_LEGENDS.TEMPORARY_APPROVED
            },
            attributes: ['id', 'internalReferenceNumber', 'temporaryExpirationDate']
        });

        return {
            count: expiringSoon.length,
            reports: expiringSoon
        };
    }
} 