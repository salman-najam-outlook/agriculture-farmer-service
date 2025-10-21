'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'deforestation_area', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('deforestation_report_requests', 'forest_area_2020', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
    await queryInterface.addColumn('deforestation_report_requests', 'forest_area_2022', {
      type: Sequelize.FLOAT,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
