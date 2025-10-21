'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_question_options', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assessment_question_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      label : {
        type: Sequelize.STRING,
        allowNull: true
      },
      value : {
        type: Sequelize.STRING,
        allowNull: true
      },
      checklists : {
        type: Sequelize.JSON,
        allowNull: true,
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessment_question_options');
  }
};