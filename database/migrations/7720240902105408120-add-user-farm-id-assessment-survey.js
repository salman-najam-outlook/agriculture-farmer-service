"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      "assessment_surveys",
      "user_farm_id",
      {
        allowNull: true,
        type: Sequelize.INTEGER,
        default: null
      },
    );

    await queryInterface.addConstraint(
      "assessment_surveys",
      {
        fields: ["user_farm_id"],
        type: "FOREIGN KEY",
        name: "user_farm_survey_fk",
        allowNull: true,
        references: {
          table: "user_farms",
          field: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColumn(
      "assessment_surveys",
      "user_farm_id",
    );

    await queryInterface.removeConstraint(
      "assessment_surveys",
      "user_farm_survey_fk"
    );
  },
};
