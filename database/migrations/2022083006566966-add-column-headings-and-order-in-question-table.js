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
      'heading_id',
      {
        allowNull: true,
        type: Sequelize.INTEGER
      },
    );
    await queryInterface.addColumn(
      'assessment_questions',
      'order',
      {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValue: 0
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
