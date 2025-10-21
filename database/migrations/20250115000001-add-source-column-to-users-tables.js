'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users_dds', 'source', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Source of user creation: saas_api, farmer_service, etc.'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('users_dds', 'source');
  }
};
