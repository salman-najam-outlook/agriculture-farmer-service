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
    await queryInterface.addColumn('dds_report_exporter', 'diligence_report_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'diligence_reports', // name of target table
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL', // or CASCADE based on your needs
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeColumn('dds_report_exporter', 'diligence_report_id');
  }
};
