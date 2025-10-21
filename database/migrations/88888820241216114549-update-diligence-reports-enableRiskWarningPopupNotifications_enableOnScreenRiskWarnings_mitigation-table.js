'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn('diligence_reports', 'enableRiskWarningPopupNotifications', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      }, { transaction });
      await queryInterface.addColumn('diligence_reports', 'enableOnScreenRiskWarnings', {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: true,
      }, { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('diligence_reports', 'enableRiskWarningPopupNotifications', { transaction });
      await queryInterface.removeColumn('diligence_reports', 'enableOnScreenRiskWarnings', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};