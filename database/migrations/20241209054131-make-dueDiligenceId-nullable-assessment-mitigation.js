'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('assessment_question_mitigation', 'dueDiligenceId', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn('assessment_question_mitigation', 'dueDiligenceId', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  }
};