'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn("diligence_reports", "pointFarmDefaultArea", {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 4.0
    });

  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn("diligence_reports", "pointFarmDefaultArea");
  }
};