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
    await queryInterface.addColumn(
      "assessment_uploads",
      "diligence_report_id",
      {
        type: Sequelize.INTEGER,
        references: {
          model: "diligence_reports",
          key: "id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
        allowNull: true,
        after: "assessment_id",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('assessment_uploads', 'diligence_report_id');
  },
};
