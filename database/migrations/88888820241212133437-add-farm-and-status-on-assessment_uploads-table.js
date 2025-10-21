'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'assessment_uploads',
        'farmId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'user_farms',
            key: 'id',
          },
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'assessment_uploads',
        'riskAssessmentStatus',
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
      await queryInterface.removeColumn('assessment_uploads', 'farmId', { transaction });
      await queryInterface.removeColumn('assessment_uploads', 'riskAssessmentStatus', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
