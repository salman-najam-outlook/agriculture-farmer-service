"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("assessment_questions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      parent_question_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      assessment_question_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_mandatory: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_enabled: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      is_file_type: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      file_type_additional_settings: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      is_digital_signature_type: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      digital_signature_type_additional_settings: {
        type: Sequelize.JSON,
        allowNull: true,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("assessment_questions");
  },
};
