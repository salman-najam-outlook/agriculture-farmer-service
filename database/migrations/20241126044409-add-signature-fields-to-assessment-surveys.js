'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assessment_surveys', 'signatureOwner', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('assessment_surveys', 'signatureCreatedAt', {
      type: Sequelize.DATE,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('assessment_surveys', 'signatureOwner');
    await queryInterface.removeColumn('assessment_surveys', 'signatureCreatedAt');
  }
};