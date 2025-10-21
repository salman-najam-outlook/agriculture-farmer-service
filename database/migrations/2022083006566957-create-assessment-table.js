'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      user_id : {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      title : {
        type: Sequelize.STRING,
        allowNull: true
      },      
      country : {
        type: Sequelize.STRING,
        allowNull: true
      },      
      description : {
        type: Sequelize.STRING,
        allowNull: true
      },
      assessment_type : {
        type: Sequelize.STRING,
        allowNull: false,
      },
      no_of_question : {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      no_of_response : {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      status : {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_applicable_to_selected_users_only : {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      is_deleted : {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessments');
  }
};