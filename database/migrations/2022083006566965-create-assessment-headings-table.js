'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_question_headings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      
      title : {
        type: Sequelize.STRING,
        allowNull: true
      },      
      order : {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
    
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessment_question_headings');
  }
};