'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'assessment_question_mitigation',
        'userFarmId',
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
        'assessment_question_mitigation',
        'assessmentResponseId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'assessment_responses',
            key: 'id',
          },
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
      await queryInterface.removeColumn('assessment_question_mitigation', 'userFarmId', { transaction });
      await queryInterface.removeColumn('assessment_question_mitigation', 'assessmentResponseId', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
