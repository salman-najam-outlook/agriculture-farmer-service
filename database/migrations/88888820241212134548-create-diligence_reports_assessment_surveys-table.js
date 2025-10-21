'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'diligence_reports_assessment_surveys',
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
        assessmentSurveyId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'assessment_surveys',
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
          diligenceReportId_assessmentSurveyId_uniqueIdx: {
            fields: ['diligenceReportId', 'diligenceReportProductionPlaceId', 'assessmentSurveyId'],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_assessment_surveys');
  },
};
