'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'assessment_settings',
      'expiry_period',
      {
        allowNull: true,
        type: Sequelize.STRING
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColumn(
      'assessment_settings',
      'expiry_period',
    );
  },
};
