'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'diligence_reports_assessment_responses',
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
        assessmentResponseId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'assessment_responses',
            key: 'id',
          },
          allowNull: false,
        },
      },
      {
        uniqueKeys: {
          diligenceReportId_assessmentResponseId_uniqueIdx: {
            fields: ['diligenceReportId', 'assessmentResponseId'],
          },
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_assessment_responses');
  },
};
