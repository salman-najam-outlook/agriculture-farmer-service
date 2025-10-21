'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'isCertified', {
      type: Sequelize.BOOLEAN,
      allowNull: false, defaultValue: false
    });
    await queryInterface.addColumn('deforestation_report_requests', 'isCertificateReady', {
      type: Sequelize.BOOLEAN,
      allowNull: false, defaultValue: false
    });
    await queryInterface.addColumn('deforestation_report_requests', 'status', {
      type: Sequelize.STRING,
      defaultValue: 'REQUESTED'
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
