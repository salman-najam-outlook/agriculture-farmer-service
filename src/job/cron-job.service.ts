import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DiligenceReportService } from '../diligence-report/diligence-report.service'
import { DiligenceReport } from '../diligence-report/entities/diligence-report.entity'
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize'
import { ProductionPlaceWarningService } from "src/due-diligence/production-place/production-place-warning.service"
import { ApprovalFlowSettingsService } from '../due-diligence/approval-flow-setting/approval-flow-settings.service'
import { STATUS_LEGENDS } from '../constants/status-legends.constant';

@Injectable()
export class CronJobService {
  private readonly logger = new Logger(CronJobService.name);
  constructor(
    @InjectModel(DiligenceReport) private DiligenceReportModel: typeof DiligenceReport,
    private diligenceReportService: DiligenceReportService,
    private productionPlaceWarningService:ProductionPlaceWarningService,
    private approvalFlowSettingsService: ApprovalFlowSettingsService,
  ){
    
  }

  @Cron(CronExpression.EVERY_2_HOURS)
  async handleSeventyTwoHourDiligenceReportPublish() {
    const currentTime = new Date();
    const twoHoursLater = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000);
    const reportBeyond2Hour = await this.DiligenceReportModel.findAll({
      where:{
        isDeleted:0,
        blockchainPublishDate: {
          [Op.between]: [currentTime, twoHoursLater],
          [Op.not]:null
        },
      }
    })
    this.logger.debug('Called when the current second is 45');
    console.log(reportBeyond2Hour.length)
    console.log("-------------------------------------------------------")
    console.log("45 second coun")
    if(!reportBeyond2Hour.length) return 
    for(let report of reportBeyond2Hour) {
      if(!['Complaint','Non-Complaint'].includes(report.status)){
         const concludeResult = await this.productionPlaceWarningService.concludeReportNonComplaint(report.id)
         const allZero = Object.values(concludeResult).every(value => value === 0);
         let sts = ''
          if(allZero){ 
            sts = 'Complaint'
          }else{
            sts = 'Non-Complaint'
          }
        await this.diligenceReportService.changeStatus({
            id:report.id,
            status:sts
        })
      }
      await this.diligenceReportService.generateComplianceByDiligenceId(report.id)
      report.blockchainPublishDate = null
      await report.save()
    }
    
  }

  /**
   * Cron job that runs every hour to check for overdue reports
   * and automatically update their status to 'overdue'
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueReportsCheck() {
    this.logger.log('Starting overdue reports check...');
    
    try {
      const reportsToCheck = await this.DiligenceReportModel.findAll({
        where: {
          isDeleted: 0,
          statusLegends: {
            [Op.notIn]: [
              STATUS_LEGENDS.OVERDUE,
              STATUS_LEGENDS.APPROVED,
              STATUS_LEGENDS.REJECTED
            ]
          },
          createdAt: {
            [Op.not]: null
          }
        },
        attributes: ['id', 'createdAt', 'organizationId', 'statusLegends'],
        group: ['organizationId'] 
      });

      if (reportsToCheck.length === 0) {
        this.logger.log('No reports to check for overdue status');
        return;
      }

      this.logger.log(`Found ${reportsToCheck.length} reports to check for overdue status`);

      let updatedCount = 0;
      const organizationIds = [...new Set(reportsToCheck.map(report => report.organizationId))];

      // Process each organization's reports
      for (const organizationId of organizationIds) {
        const organizationReports = reportsToCheck.filter(report => report.organizationId === organizationId);
        
        for (const report of organizationReports) {
          try {
                        const isOverdue = await this.approvalFlowSettingsService.isReportOverdue(
                report.createdAt,
                organizationId
            );

            if (isOverdue !== null) {
                if (isOverdue) {
                    await this.DiligenceReportModel.update(
                        { statusLegends: STATUS_LEGENDS.OVERDUE },
                        { where: { id: report.id } }
                    );
                    updatedCount++;
                    this.logger.log(`Updated report ${report.id} to overdue status`);
                } else if (report.statusLegends === STATUS_LEGENDS.OVERDUE) {
                    await this.DiligenceReportModel.update(
                        { statusLegends: STATUS_LEGENDS.PENDING_NEWLY_RECEIVED },
                        { where: { id: report.id } }
                    );
                    updatedCount++;
                    this.logger.log(`Updated report ${report.id} to pending status`);
                }
            }
          } catch (error) {
            this.logger.error(`Error checking overdue status for report ${report.id}:`, error);
          }
        }
      }

      this.logger.log(`Successfully updated ${updatedCount} reports to overdue status`);
    } catch (error) {
      this.logger.error('Error in overdue reports check:', error);
    }
  }
}