"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn(
      "assessment_responses",
      "due_diligence_id",
      "survey_id"
    );

    await queryInterface.removeColumn(
      "assessment_responses",
      "assessment_id",
    );
    await queryInterface.removeColumn(
      "assessment_responses",
      "user_id",
    );
  },
  down: async (queryInterface, Sequelize) => {},
};
