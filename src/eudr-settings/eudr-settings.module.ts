import { Module } from '@nestjs/common';
import { EudrSettingsService } from './eudr-settings.service';
import { EudrSettingsResolver } from './eudr-settings.resolver';
import { SequelizeModule } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import { EudrSetting } from './entities/eudr-setting.entity';
import { RiskAssessmentLevels } from './entities/risk-assessment-levels.entity';
import { DeclarationStatements } from './entities/declaration-statements.entity';
import { DeforestationAssessmentRiskToleranceLevels } from './entities/deforestation-assessment-risk-tolerance-levels.entity';
import { EudrSettingController } from './eudr-settings.controller';

@Module({
  imports: [
    SequelizeModule.forFeature([
      EudrSetting,
      RiskAssessmentLevels,
      DeclarationStatements,
      DeforestationAssessmentRiskToleranceLevels
    ])
  ],
  providers: [
    EudrSettingsResolver, 
    EudrSettingsService,
    { provide: "SEQUELIZE", useExisting: Sequelize },
  ],
  controllers: [EudrSettingController],
  exports: [SequelizeModule],
})
export class EudrSettingsModule {}
