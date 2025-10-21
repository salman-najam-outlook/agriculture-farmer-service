"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("due_diligence_production_places", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      farmId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user_farms",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      dueDiligenceReportId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "diligence_reports",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      removed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      high_probability_area: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      low_probability_area: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      negligible_probability_area: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      eudr_deforestation_status: {
        type: Sequelize.ENUM(
          "Very High Probability",
          "High Probability",
          "Low Probability",
          "Zero/Negligible Probability",
          "Manually Mitigated",
          "Very High Deforestation Probability",
          "High Deforestation Probability",
          "Medium Deforestation Probability",
          "Low Deforestation Probability",
          "Very Low Deforestation Probability",
          "Zero/Negligible Deforestation Probability"
        ),
        allowNull: true,
      },

      risk_mitigation_comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("due_diligence_production_places");
  },
};
