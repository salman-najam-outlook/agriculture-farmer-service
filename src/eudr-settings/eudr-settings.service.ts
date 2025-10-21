import { HttpException, Inject, Injectable } from '@nestjs/common';
import { CreateEudrSettingInput } from './dto/create-eudr-setting.input';
import {UpdateEudrSettingInput } from './dto/update-eudr-declaration.input';
import { InjectModel } from '@nestjs/sequelize';
import { EudrSetting } from './entities/eudr-setting.entity';
import { Sequelize } from 'sequelize-typescript';
import { RiskAssessmentLevels } from './entities/risk-assessment-levels.entity';
import { DeclarationStatements } from './entities/declaration-statements.entity';
import { DeforestationAssessmentRiskToleranceLevels } from './entities/deforestation-assessment-risk-tolerance-levels.entity';

@Injectable()
export class EudrSettingsService {
  constructor(
    @InjectModel(EudrSetting)
    private eudrSettingModel: typeof EudrSetting,
    @InjectModel(RiskAssessmentLevels)
    private riskAssessmentLevelModel: typeof RiskAssessmentLevels,
    @InjectModel(DeforestationAssessmentRiskToleranceLevels)
    private riskToleranceLevelModel: typeof DeforestationAssessmentRiskToleranceLevels,
    @InjectModel(DeclarationStatements)
    private declarationStatementsModel: typeof DeclarationStatements,

    @Inject("SEQUELIZE")
    private sequelize: Sequelize,
  ) {}

  async create(createEudrSettingInput: CreateEudrSettingInput, organizationId: string | number) {
    let t = await this.sequelize.transaction();
    try {
      let {
        radius_unit,
        radius_max_limit,
        isDefault,
        product_mass_unit,
        volume_unit,
        user_type,
        eudr_api_key,
        eudr_api_secret,
        risk_level,
        riskToleranceLevels,
        dynamicExpiryTime,
        dynamicExpiryTimePeriod,
        toggleAutoRenewWhenReportAdded,
        declarationStatementCountry,
        declarations,
        public_geofence_download,
        public_deforestation_summary
      } = createEudrSettingInput;

      let isExist = await this.eudrSettingModel.findOne({ where: {
        org_id: organizationId,
      }})
      let eudrSetting;

      if (isExist) {
        try {
          await this.riskAssessmentLevelModel.update(
            {
              ...risk_level
            },
            { 
              where: {
                eudr_settings_id: isExist.id,
              },
              transaction: t
            }
          )

          let toleranceLevelSetting = await this.riskToleranceLevelModel.findOne({ where: {
              eudr_settings_id:isExist.id
          }})

          if(toleranceLevelSetting) {
            await this.riskToleranceLevelModel.update(
                {
                  ...riskToleranceLevels
                },
                {
                  where: {
                    eudr_settings_id: isExist.id,
                  },
                  transaction: t
                }
            )
          }else{
            // this is only for eudr_settings created before risk_tolerance_level_implemented
            await this.riskToleranceLevelModel.create(
                { ...riskToleranceLevels, eudr_settings_id: isExist.id },
                {
                  transaction: t
                }
            )
          }

          let set = {
            org_id: organizationId,
            radius_unit,
            radius_max_limit,
            isDefault,
            product_mass_unit,
            volume_unit,
            user_type,
            eudr_api_key,
            eudr_api_secret,
            dynamicExpiryTime: (dynamicExpiryTime === 0 || dynamicExpiryTime == null) ? 6 : dynamicExpiryTime,
            dynamicExpiryTimePeriod,
            toggleAutoRenewWhenReportAdded,
            declarationStatementCountry,
            public_deforestation_summary,
            public_geofence_download
          }
  
          await this.eudrSettingModel.update(
            { ...set },
            {
              where: {
                org_id: organizationId,
              },
              transaction: t,
            }
          )
  
          await this.declarationStatementsModel.destroy({
            where: {
              eudr_settings_id: isExist.id
            },
            transaction: t
          })
  
          let newDeclarations = declarations.map((d) => {
            return {
              ...d,
              eudr_settings_id: isExist.id
            }
          })
          await this.declarationStatementsModel.bulkCreate(newDeclarations, { 
            transaction: t
          });
          eudrSetting = isExist;
        } catch (err) {
          console.log(err, "###########")
        }
      } else {
        const riskLevel = await this.riskAssessmentLevelModel.create( 
          { ...risk_level },
          {
            transaction: t
          }
        )
  
        let set = {
          org_id: organizationId,
          risk_mitigation_level_id: riskLevel.id,
          radius_unit,
          radius_max_limit,
          isDefault,
          product_mass_unit,
          volume_unit,
          user_type,
          eudr_api_key,
          eudr_api_secret,
          dynamicExpiryTime: (dynamicExpiryTime === 0 || dynamicExpiryTime == null) ? 6 : dynamicExpiryTime,
          dynamicExpiryTimePeriod,
          toggleAutoRenewWhenReportAdded,
          declarationStatementCountry,
          public_deforestation_summary,
          public_geofence_download
        }
  
        eudrSetting = await this.eudrSettingModel.create(
          { ...set },
          { 
            transaction: t
          }
        )

        if(eudrSetting){
          await riskLevel.update({ eudr_settings_id: eudrSetting.id }, { transaction: t })

          await this.riskToleranceLevelModel.create( 
            { ...riskToleranceLevels, eudr_settings_id: eudrSetting.id },
            {
              transaction: t
            }
          )
          
          let declarationList = declarations.map((d) => {
            return {
              ...d,
              eudr_settings_id: eudrSetting.id
            }
          })
          await this.declarationStatementsModel.bulkCreate(declarationList, { 
            transaction: t
          })
        }
  
      }
      await t.commit();
      return eudrSetting
    } catch (err) {
      console.log(err, "@@@@@@@")
      await t.rollback();
      if (err?.status == 401) {
        throw new HttpException(err.message, err.status || 500);
      }
    }
  }


  async updateEudrSetting(eudrSettingId: number, updateEudrSettingInput: UpdateEudrSettingInput) {
    const t = await this.sequelize.transaction();
    try {
      // Destructure input data
      const { declarations, ...eudrSettingUpdates } = updateEudrSettingInput;
  
      // Fetch existing EudrSetting
      const eudrSetting = await this.eudrSettingModel.findByPk(eudrSettingId);
      if (!eudrSetting) {
        throw new Error('EudrSetting not found');
      }
  
      // Update EudrSetting fields if necessary
      await eudrSetting.update(eudrSettingUpdates, { transaction: t });
  
      // Update DeclarationStatements
      // Remove existing declarations for this EudrSetting
      await this.declarationStatementsModel.destroy({
        where: { eudr_settings_id: eudrSettingId },
        transaction: t
      });
  
      // Create new declarations without needing an ID
      const newDeclarations = declarations.map(declaration => ({
        ...declaration,
        eudr_settings_id: eudrSettingId
      }));
  
      // Insert new declarations
      await this.declarationStatementsModel.bulkCreate(newDeclarations, { transaction: t });
  
      // Commit the transaction
      await t.commit();
  
      // Return updated EudrSetting with new declarations
      return await this.eudrSettingModel.findByPk(eudrSettingId, {
        include: [this.declarationStatementsModel]
      });
    } catch (error) {
      await t.rollback();
      throw new Error(error.message || 'Failed to update EudrSetting');
    }
  }
  

  async findAll() {
    let eudrSettings = await this.eudrSettingModel.findAll();
    return eudrSettings;
  }

  async findOne(organizationId: number | string) {
    let eudrSettings = await this.eudrSettingModel.findOne(
      { where: { org_id: organizationId },
      include: [
        {
          model: RiskAssessmentLevels,
          as: "riskLevel",
        },
        {
          model: DeforestationAssessmentRiskToleranceLevels,
          as: "riskToleranceLevels",
        },
        {
          model: DeclarationStatements,
          as: "declarations",
        }
      ]
    });


    // If no settings exist for this organization, create default settings
    if (!eudrSettings) {
      const t = await this.sequelize.transaction();
      try {
        const defaultRiskLevel = await this.riskAssessmentLevelModel.create(
          {
            very_high: true,
            high: true,
            medium: true,
            low: true,
            very_low: true,
            zero: true,
          },
          { transaction: t }
        );

        // Create default EUDR settings
        const defaultEudrSettings = await this.eudrSettingModel.create(
          {
            org_id: organizationId,
            radius_unit: "m",
            radius_max_limit: 1000,
            isDefault: false,
            product_mass_unit: "kg",
            volume_unit: "m3",
            user_type: "supplier",
            eudr_api_key: "",
            eudr_api_secret: "",
            dynamicExpiryTime: 1,
            dynamicExpiryTimePeriod: "month",
            toggleAutoRenewWhenReportAdded: "auto",
            declarationStatementCountry: "",
            public_geofence_download: false,
            public_deforestation_summary: false,
            risk_mitigation_level_id: defaultRiskLevel.id,
          },
          { transaction: t }
        );

        await defaultRiskLevel.update(
          { eudr_settings_id: defaultEudrSettings.id },
          { transaction: t }
        );


        await this.declarationStatementsModel.create(
          {
            title: "Declaration Statement",
            country: "id",
            description: "The commodities/products supplied meet all requirements of Regulation (EU) 2023/1115. This lot has been duly verified and approved, ensuring compliance with Indonesian regulations. All identified risks were properly mitigated",
            eudr_settings_id: defaultEudrSettings.id,
            isEnabled: true,
          },
          { transaction: t }
        );

        await this.riskToleranceLevelModel.create(
          {
            very_high: 0,
            high: 0,
            medium: 0,
            low: 0,
            very_low: 0,
            eudr_settings_id: defaultEudrSettings.id,
          },
          { transaction: t }
        );

        // Commit transaction
        await t.commit();

        // Fetch the created settings with includes
        eudrSettings = await this.eudrSettingModel.findOne(
          { where: { org_id: organizationId },
          include: [
            {
              model: RiskAssessmentLevels,
              as: "riskLevel",
            },
            {
              model: DeforestationAssessmentRiskToleranceLevels,
              as: "riskToleranceLevels",
            },
            {
              model: DeclarationStatements,
              as: "declarations",
            }
          ]
        });

        if (!eudrSettings) {
          throw new Error('Failed to create or retrieve EUDR settings');
        }
      } catch (error) {
        await t.rollback();
        eudrSettings = await this.eudrSettingModel.findOne(
          { where: { org_id: organizationId },
          include: [
            {
              model: RiskAssessmentLevels,
              as: "riskLevel",
            },
            {
              model: DeforestationAssessmentRiskToleranceLevels,
              as: "riskToleranceLevels",
            },
            {
              model: DeclarationStatements,
              as: "declarations",
            }
          ]
        });

        if (!eudrSettings) {
          throw new Error(`Failed to create or retrieve EUDR settings after retry. Original error: ${error.message}`);
        }
      }
    }

    return eudrSettings;
  }
}
