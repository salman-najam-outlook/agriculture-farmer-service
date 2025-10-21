'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_options_and_sub_questions_mappings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      parent_question_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      option_id : {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      sub_question_id : {
        type: Sequelize.INTEGER,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessment_options_and_sub_questions_mappings');
  }
};