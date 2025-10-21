'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('risk_levels', 'very_low', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
  },

  async down (queryInterface, Sequelize) {

    await queryInterface.removeColumn('risk_levels', 'very_low');
  }
};
