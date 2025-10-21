'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('diligence_reports', 'enableRiskAssessmentCriteria', {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
    await queryInterface.addColumn('diligence_reports', 'enableProtectedAndIndigenousAreas', {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: true
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('diligence_reports', 'enableRiskAssessmentCriteria');
    await queryInterface.removeColumn('diligence_reports', 'enableProtectedAndIndigenousAreas');
  }
};
