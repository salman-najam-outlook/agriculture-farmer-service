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
      'createdAt',
      {
        allowNull: false,
        type: Sequelize.DATE
      },
    );
    await queryInterface.addColumn(
      'assessment_questions',
      'updatedAt',
      {
        allowNull: false,
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
