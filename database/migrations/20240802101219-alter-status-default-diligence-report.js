"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn("diligence_reports", "status", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "Pending",
    });

    await queryInterface.addColumn("diligence_reports", "organizationId", {
      type: Sequelize.INTEGER,
        references: {
          model: "organization",
          key: "id",
        },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
