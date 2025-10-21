'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('assessment_settings', {
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
      expiry_date : {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_scheduled : {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      scheduled_date : {
        type: Sequelize.STRING,
        allowNull: true
      },
      is_multi_step : {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false
      },
      multi_step_type : {
        type: Sequelize.STRING,
        allowNull: true
      },
      no_of_questions : {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      no_of_headings : {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: true
      },
      allow_multiple_entries : {
        type: Sequelize.STRING,
        allowNull: true
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('assessment_settings');
  }
};