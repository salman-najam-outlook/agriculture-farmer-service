'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'assessment_surveys',
        'riskAssessmentStatus',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'assessment_surveys',
        'originalRiskAssessmentStatus',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('assessment_surveys', 'riskAssessmentStatus', { transaction });
      await queryInterface.removeColumn('assessment_surveys', 'originalRiskAssessmentStatus', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
