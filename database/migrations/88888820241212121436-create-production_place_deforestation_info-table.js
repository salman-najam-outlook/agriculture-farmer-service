'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('production_place_deforestation_info', {
      id: {
        primaryKey: true,
        type: Sequelize.BIGINT({ unsigned: true }),
        autoIncrement: true,
      },
      deforestationReportRequestId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'deforestation_report_requests',
          key: 'id',
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
        allowNull: true,
      },
      deforestationMitigationComment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      deforestationStatus: {
        type: Sequelize.ENUM([
          'Manually Mitigated',
          'Very High Deforestation Probability',
          'High Deforestation Probability',
          'Medium Deforestation Probability',
          'Low Deforestation Probability',
          'Very Low Deforestation Probability',
          'Zero/Negligible Deforestation Probability',
        ]),
        allowNull: true,
      },
      originalDeforestationStatus: {
        type: Sequelize.ENUM([
          'Very High Deforestation Probability',
          'High Deforestation Probability',
          'Medium Deforestation Probability',
          'Low Deforestation Probability',
          'Very Low Deforestation Probability',
          'Zero/Negligible Deforestation Probability',
        ]),
        allowNull: true,
      },
      deforestationStatusDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastDeforestationMitigationDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      lastDisputeResolvedDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      riskAssessmentStatus: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('production_place_deforestation_info');
  },
};
