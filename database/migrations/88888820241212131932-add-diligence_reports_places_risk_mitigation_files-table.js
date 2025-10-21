'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'diligence_reports_places_risk_mitigation_files',
      {
        id: {
          type: Sequelize.BIGINT({ unsigned: true }),
          primaryKey: true,
          autoIncrement: true,
        },
        riskMitigationFileId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'risk_mitigation_files',
            key: 'id',
          },
          allowNull: false,
        },
        diligenceReportProductionPlaceId: {
          type: Sequelize.BIGINT({ unsigned: true }),
          references: {
            model: 'diligence_reports_due_diligence_production_places',
            key: 'id',
          },
        },
      },
      {
        uniqueKeys: {
          diligenceReportId_riskMitigationFileId_uniqueIdx: {
            fields: ['diligenceReportProductionPlaceId', 'riskMitigationFileId'],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_places_risk_mitigation_files');
  },
};
