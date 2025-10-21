'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'diligence_reports_places_assessment_production_places',
      {
        id: {
          type: Sequelize.BIGINT({ unsigned: true }),
          primaryKey: true,
          autoIncrement: true,
        },
        assessmentProductionPlaceId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'assessment_production_place',
            key: 'id',
          },
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
          diligenceReportId_assessmentPlaceId_uniqueIdx: {
            fields: ['diligenceReportProductionPlaceId', 'assessmentProductionPlaceId'],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_places_assessment_production_places');
  },
};
