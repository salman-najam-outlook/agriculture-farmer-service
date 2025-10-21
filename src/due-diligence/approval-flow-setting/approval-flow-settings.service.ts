import { Injectable, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ApprovalFlowSetting } from './entities/approval-flow-settings.entity';
import { CreateApprovalFlowSettingInput } from './dto/create-approval-flow-settings.input';
import { UpdateApprovalFlowSettingInput } from './dto/update-approval-flow-settings.input';
import { DocumentVisibility, TimeUnit } from './entities/approval-flow-settings.entity';

@Injectable()
export class ApprovalFlowSettingsService {  
    constructor(
        @InjectModel(ApprovalFlowSetting)
        private approvalFlowSettingModel: typeof ApprovalFlowSetting,

        @Inject("SEQUELIZE")
        private sequelize: Sequelize,       
    ) {}

    async create(createApprovalFlowSettingInput: CreateApprovalFlowSettingInput, organizationId: number){
        const t = await this.sequelize.transaction();
        
        try {
            // Check if settings already exist for this organization
            const existingSettings = await this.approvalFlowSettingModel.findOne({
                where: { org_id: organizationId }
            });

            if (existingSettings) {
                throw new HttpException(
                    'Settings already exist for this organization. Use update instead.',
                    HttpStatus.CONFLICT
                );
            }

            // Set default values if not provided
            const settingsData = {
                ...createApprovalFlowSettingInput,
                org_id: organizationId,
                document_visibility: createApprovalFlowSettingInput.document_visibility || DocumentVisibility.PRIVATE,
                approval_expiration_period: createApprovalFlowSettingInput.approval_expiration_period || 26,
                approval_expiration_unit: createApprovalFlowSettingInput.approval_expiration_unit || TimeUnit.DAYS,
                is_default: createApprovalFlowSettingInput.is_default || false
            };

            const settings = await this.approvalFlowSettingModel.create(settingsData, { transaction: t });
            
            await t.commit();
            return settings;
        } catch (error) {
            await t.rollback();
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to create approval flow settings',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findAll() {
        try {
            return await this.approvalFlowSettingModel.findAll({
                order: [['created_at', 'DESC']]
            });
        } catch (error) {
            throw new HttpException(
                'Failed to fetch approval flow settings',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findOne(id: number) {
        try {
            const settings = await this.approvalFlowSettingModel.findByPk(id);
            if (!settings) {
                throw new HttpException(
                    'Approval flow settings not found',
                    HttpStatus.NOT_FOUND
                );
            }
            return settings;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to fetch DDS report settings',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async findByOrgId(organizationId: number) {
        try {
            const settings = await this.approvalFlowSettingModel.findOne({
                where: { org_id: organizationId }
            });
            
            return settings;
        } catch (error) {
            throw new HttpException(
                'Failed to fetch approval flow settings for organization',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async updateByOrgId(orgId: number, updateApprovalFlowSettingInput: UpdateApprovalFlowSettingInput) {
        const t = await this.sequelize.transaction();
        
        try {
            let settings = await this.approvalFlowSettingModel.findOne({
                where: { org_id: orgId }
            });

            if (!settings) {
                // Create new settings if they don't exist
                const createInput: CreateApprovalFlowSettingInput = {
                    ...updateApprovalFlowSettingInput
                };
                settings = await this.create(createInput, orgId);
            } else {
                // Update existing settings
                settings = await settings.update(updateApprovalFlowSettingInput, { transaction: t });
            }
            
            await t.commit();
            return settings;
        } catch (error) {
            await t.rollback();
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to update DDS report settings',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    async remove(id: number){
        const t = await this.sequelize.transaction();
        
        try {
            const settings = await this.approvalFlowSettingModel.findByPk(id);
            if (!settings) {
                throw new HttpException(
                    'Approval flow settings not found',
                    HttpStatus.NOT_FOUND
                );
            }

            await settings.destroy({ transaction: t });
            
            await t.commit();
            return true;
        } catch (error) {
            await t.rollback();
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException(
                'Failed to delete approval flow settings',
                HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }

    /**
     * Check if a report is overdue based on creation time and approval settings
     * @param reportCreatedAt - The creation date of the report
     * @param organizationId - The organization ID to get settings for
     * @returns boolean indicating if the report is overdue
     */
    async isReportOverdue(reportCreatedAt: Date, organizationId: number): Promise<boolean | null> {
        try {
            const settings = await this.findByOrgId(organizationId);
            
            if (!settings || !settings.approval_expiration_period || !settings.approval_expiration_unit) {
                return null;
            }

            return this.calculateOverdueStatus(
                reportCreatedAt, 
                settings.approval_expiration_period, 
                settings.approval_expiration_unit
            );
        } catch (error) {
            console.error('Error checking overdue status:', error);
            return null;
        }
    }

    /**
     * Calculate if a report is overdue based on creation time and expiration settings
     * @param reportCreatedAt - The creation date of the report
     * @param expirationPeriod - The expiration period value
     * @param expirationUnit - The expiration unit (days, weeks, months)
     * @returns boolean indicating if the report is overdue
     */
    private calculateOverdueStatus(
        reportCreatedAt: Date, 
        expirationPeriod: number, 
        expirationUnit: string
    ): boolean {
        const now = new Date();
        const expirationDate = new Date(reportCreatedAt);

        switch (expirationUnit.toLowerCase()) {
            case 'days':
                expirationDate.setDate(expirationDate.getDate() + expirationPeriod);
                break;
            case 'weeks':
                expirationDate.setDate(expirationDate.getDate() + (expirationPeriod * 7));
                break;
            case 'months':
                expirationDate.setMonth(expirationDate.getMonth() + expirationPeriod);
                break;
            default:
                expirationDate.setDate(expirationDate.getDate() + expirationPeriod);
        }

        return now > expirationDate;
    }
}