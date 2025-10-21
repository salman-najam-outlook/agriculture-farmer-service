"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.renameColumn(
      "deforestation_report_requests",
      "version",
      "modelVersion"
    );

    await queryInterface.renameColumn(
      "deforestation_report_requests",
      "centerGeohash",
      "circularDataSHA256"
    );

    await queryInterface.renameColumn(
      "deforestation_report_requests",
      "polygonGeohash",
      "polygonalDataSHA256"
    );

    await queryInterface.addColumn(
      "deforestation_report_requests",
      "issueDate",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
    await queryInterface.addColumn("deforestation_report_requests", "title", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn(
      "deforestation_report_requests",
      "geometryType",
      {
        type: Sequelize.STRING,
        allowNull: true,
      }
    );
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
