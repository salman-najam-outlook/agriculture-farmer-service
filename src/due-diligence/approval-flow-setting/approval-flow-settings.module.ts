import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { ApprovalFlowSettingsService } from './approval-flow-settings.service';
import { ApprovalFlowSettingsController } from './approval-flow-settings.controller';
import { ApprovalFlowSettingsResolver } from './approval-flow-settings.resolver';
import { ApprovalFlowSetting } from './entities/approval-flow-settings.entity';

@Module({
  imports: [
    SequelizeModule.forFeature([ApprovalFlowSetting])
  ],
  providers: [
    ApprovalFlowSettingsService,
    ApprovalFlowSettingsResolver,
    { provide: "SEQUELIZE", useExisting: Sequelize }
  ],
  controllers: [ApprovalFlowSettingsController],
  exports: [SequelizeModule],
})
export class ApprovalFlowSettingModule {}
