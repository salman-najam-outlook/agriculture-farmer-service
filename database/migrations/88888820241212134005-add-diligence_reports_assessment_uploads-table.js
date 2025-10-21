'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'diligence_reports_assessment_uploads',
      {
        id: {
          type: Sequelize.BIGINT({ unsigned: true }),
          primaryKey: true,
          autoIncrement: true,
        },
        diligenceReportId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'diligence_reports',
            key: 'id',
          },
          allowNull: false,
        },
        assessmentUploadId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'assessment_uploads',
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
          allowNull: true,
        },
      },
      {
        uniqueKeys: {
          diligenceReportId_assessmentUploadId_uniqueIdx: {
            fields: ['diligenceReportId', 'diligenceReportProductionPlaceId', 'assessmentUploadId'],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_assessment_uploads');
  },
};
