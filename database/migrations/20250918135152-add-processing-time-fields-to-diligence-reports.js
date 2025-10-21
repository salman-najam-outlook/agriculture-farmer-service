'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('diligence_reports', 'approvedDate', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Date when the report was approved by the assigned worker'
    });

    await queryInterface.addColumn('diligence_reports', 'processingTimeInDays', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Processing time in days between assignment and approval'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('diligence_reports', 'approvedDate');
    await queryInterface.removeColumn('diligence_reports', 'processingTimeInDays');
  }
};
