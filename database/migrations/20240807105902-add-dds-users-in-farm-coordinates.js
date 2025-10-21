'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.changeColumn("user_farm_coordinates", "userId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });


    await queryInterface.addColumn("user_farm_coordinates", "userDdsId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: "userId",
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
