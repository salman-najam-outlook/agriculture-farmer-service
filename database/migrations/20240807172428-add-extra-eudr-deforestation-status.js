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
    await queryInterface.changeColumn("due_diligence_production_places", "eudr_deforestation_status", {
      type: Sequelize.ENUM(
        "Very High Probability",
        "High Probability",
        "Low Probability",
        "Zero/Negligible Probability",
        "Manually Mitigated",
        "Very High Deforestation Probability",
        "High Deforestation Probability",
        "Medium Deforestation Probability",
        "Low Deforestation Probability",
        "Very Low Deforestation Probability",
        "Zero/Negligible Deforestation Probability"
      ),
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
