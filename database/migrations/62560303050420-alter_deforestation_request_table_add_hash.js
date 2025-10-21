'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'report_guid', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('deforestation_report_requests', 'transaction_hash', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('deforestation_report_requests', 'keccak_hash', {
      type: Sequelize.STRING,
      allowNull: true,
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
