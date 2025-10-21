'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'assessment_surveys',
      'expiresOn',
      {
        allowNull: true,
        type: Sequelize.DATE
      },
    );
    await queryInterface.addColumn(
      'assessment_surveys',
      'status',
      {
        allowNull: false,
        default: "AVAILABLE",
        type: Sequelize.ENUM("AVAILABLE", "IN_PROGRESS", "COMPLETED")
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColumn(
      'assessment_surveys',
      'status'
    );

    await queryInterface.dropColumn(
      'assessment_surveys',
      'expiresOn'
    );
  },
};
