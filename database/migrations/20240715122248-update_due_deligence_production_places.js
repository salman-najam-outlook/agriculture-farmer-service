"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.removeColumn("due_diligence_production_places", "eudr_deforestation_status");

    await queryInterface.addColumn("due_diligence_production_places", "eudr_deforestation_status", {
      type: Sequelize.ENUM(
          "Manually Mitigated",
          "Very High Probability",
          "High Probability",
          "Medium Probability",
          "Low Probability",
          "Very Low Probability",
          "Zero/Negligible Probability"
      ),
      allowNull: true,
    });

    await queryInterface.addColumn("due_diligence_production_places", "assessment_data", {
      type: Sequelize.JSON,
      allowNull: true,
    });

    await queryInterface.removeColumn("due_diligence_production_places", "high_probability_area");
    await queryInterface.removeColumn("due_diligence_production_places", "low_probability_area");
    await queryInterface.removeColumn("due_diligence_production_places", "negligible_probability_area");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("due_diligence_production_places", "assessment_data");

    await queryInterface.addColumn("due_diligence_production_places", "high_probability_area", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("due_diligence_production_places", "low_probability_area", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn("due_diligence_production_places", "negligible_probability_area", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
  }
};
