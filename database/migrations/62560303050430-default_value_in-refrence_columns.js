"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(`
     update deforestation_report_requests set referenceStartDate = '2020-12-31' where true
    `);
    await queryInterface.sequelize.query(`
update deforestation_report_requests set referenceEndDate = DATE_FORMAT(updated_at, '%Y-%m-%d') where true    `);
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
