'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_responses', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      due_diligence_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      user_id : {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      assessment_id : {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      response : {
        type: Sequelize.JSON,
        allowNull: true
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessment_responses');
  }
};