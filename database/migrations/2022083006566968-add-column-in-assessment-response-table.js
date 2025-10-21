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
      'assessment_responses',
      'deletedAt',
      {
        allowNull: true,
        type: Sequelize.DATE
      },
    );
    await queryInterface.addColumn(
      'assessment_responses',
      'question_id',
      {
        allowNull: true,
        type: Sequelize.INTEGER
      },
    );
    await queryInterface.addColumn(
      'assessment_responses',
      'question_detail',
      {
        allowNull: true,
        type: Sequelize.JSON
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
