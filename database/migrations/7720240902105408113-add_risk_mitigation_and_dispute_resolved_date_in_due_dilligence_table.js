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

    await queryInterface.addColumn("due_diligence_production_places", "lastMitigatedDate", {
      type: Sequelize.DATE, 
      allowNull: true, 
    });

    await queryInterface.addColumn("due_diligence_production_places", "lastDisputeResolvedDate", {
      type: Sequelize.DATE, 
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
  }
};
