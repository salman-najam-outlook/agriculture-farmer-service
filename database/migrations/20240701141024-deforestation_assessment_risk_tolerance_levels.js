"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      "deforestation_assessment_risk_tolerance_levels",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        very_high: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER,
        },
        high: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER,
        },
        medium: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER,
        },
        low: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER,
        },
        very_low: {
          allowNull: false,
          defaultValue: 0,
          type: Sequelize.INTEGER,
        },
        eudr_settings_id: {
          allowNull: true,
          type: Sequelize.INTEGER,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable(
      "deforestation_assessment_risk_tolerance_levels"
    );
  },
};
