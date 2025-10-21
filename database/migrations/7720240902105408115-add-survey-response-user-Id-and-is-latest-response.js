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

    await queryInterface.addColumn("assessment_responses", "is_latest_version_response", {
      type: Sequelize.BOOLEAN, 
      allowNull: true, 
      defaultValue: false
    });


    await queryInterface.addColumn("assessment_responses", "user_id", {
      type: Sequelize.INTEGER, 
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('assessment_responses','is_latest_version_response');
    await queryInterface.removeColumn('assessment_responses','user_id');

  }
};
