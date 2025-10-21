'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn(
      'assessment_questions',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE
      },
    );
    await queryInterface.addColumn(
      'assessment_question_options',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE
      },
    );
    await queryInterface.addColumn(
      'assessment_options_and_sub_questions_mappings',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
