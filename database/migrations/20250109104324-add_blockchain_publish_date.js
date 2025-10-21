'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('diligence_reports', 'blockchainPublishDate', {
      allowNull: true,
      type: Sequelize.DATE,
      defaultValue: null
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('diligence_reports', 'blockchainPublishDate')
  }
};
