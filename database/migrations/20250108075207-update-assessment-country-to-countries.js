'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assessments', 'countries', {
      type: Sequelize.JSON,
      allowNull: true,
    });
    await queryInterface.removeColumn('assessments', 'country');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('assessments', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.removeColumn('assessments', 'countries');
  },
};
