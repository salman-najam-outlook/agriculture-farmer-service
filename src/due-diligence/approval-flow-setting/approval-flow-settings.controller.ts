import { 
    Controller, 
    Get, 
} from '@nestjs/common';
import { ApprovalFlowSettingsService } from './approval-flow-settings.service';
import { ApprovalFlowSetting } from './entities/approval-flow-settings.entity';

@Controller('approval-flow-settings')
export class ApprovalFlowSettingsController {
    constructor(private readonly approvalFlowSettingsService: ApprovalFlowSettingsService) {}

    @Get()
    async findAll(): Promise<ApprovalFlowSetting[]> {
        return this.approvalFlowSettingsService.findAll();
    }
}