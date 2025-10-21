'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'tree_gain_percent', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('deforestation_report_requests', 'tree_gain_area', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('deforestation_report_requests', 'forest_area_2020_percent', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0
    });
    await queryInterface.addColumn('deforestation_report_requests', 'forest_area_2022_percent', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0
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
