"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn(
      "deforestation_report_requests",
      "forest_area_2022",
      "final_forest_area"
    );
    await queryInterface.renameColumn(
      "deforestation_report_requests",
      "forest_area_2022_percent",
      "final_forest_area_percent"
    );
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
