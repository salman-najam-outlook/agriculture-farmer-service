'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'country', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Brazil'
    });
    await queryInterface.addColumn('deforestation_report_requests', 'state', {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'Parana'
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
