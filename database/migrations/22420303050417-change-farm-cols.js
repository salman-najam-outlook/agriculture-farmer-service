'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
     await queryInterface.changeColumn('user_farms', 'productionSystem', {
      allowNull: true,
      type: Sequelize.INTEGER,
    });
    await queryInterface.removeColumn('user_farms', 'farmOwner')
    await queryInterface.addColumn('user_farms', 'farmOwner', {
      allowNull: true,
      type: Sequelize.STRING,
    });
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
