'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('shipments', 'status', {
      type: Sequelize.ENUM('En Route', 'Delivered'),
      defaultValue: 'En Route',
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.changeColumn('shipments', 'status', {
      type: Sequelize.ENUM('En Route', 'Delivered'),
      defaultValue: 'En Route',
      allowNull: false,
    });
  },
};
