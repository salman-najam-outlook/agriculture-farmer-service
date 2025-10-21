'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('shipments', 'status', {
      type: Sequelize.ENUM('En Route', 'Delivered'),
      defaultValue: 'En Route',
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('shipments', 'status');
  }
};
