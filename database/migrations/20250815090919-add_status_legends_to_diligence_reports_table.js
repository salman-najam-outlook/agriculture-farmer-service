'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {

    await queryInterface.addColumn('diligence_reports', 'statusLegends', {
      allowNull: true,
      type: Sequelize.STRING,
      defaultValue: "pending",
    });


    await queryInterface.addColumn('diligence_reports', 'isTemporaryApproval', {
      allowNull: true,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('diligence_reports', 'temporaryExpirationDate', {
      allowNull: true,
      type: Sequelize.DATE
    });

    await queryInterface.addColumn('diligence_reports', 'temporaryExpirationValue', {
      allowNull: true,
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('diligence_reports', 'temporaryExpirationUnit', {
      allowNull: true,
      type: Sequelize.ENUM('days', 'months', 'years'),
      defaultValue: 'days'
    });

    await queryInterface.addColumn('diligence_reports', 'assignedTo', {
      allowNull: true,
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('diligence_reports', 'assignedToCfId', {
      allowNull: true,
      type: Sequelize.INTEGER,
    });

    await queryInterface.addColumn('diligence_reports', 'assignedDate', {
      allowNull: true,
      type: Sequelize.DATE
    });

    await queryInterface.addColumn('diligence_reports', 'rejectionReason', {
      allowNull: true,
      type: Sequelize.TEXT
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('diligence_reports', 'statusLegends');
    await queryInterface.removeColumn('diligence_reports', 'isTemporaryApproval');
    await queryInterface.removeColumn('diligence_reports', 'temporaryExpirationDate');
    await queryInterface.removeColumn('diligence_reports', 'temporaryExpirationValue');
    await queryInterface.removeColumn('diligence_reports', 'temporaryExpirationUnit');
    await queryInterface.removeColumn('diligence_reports', 'assignedTo');
    await queryInterface.removeColumn('diligence_reports', 'assignedToCfId');
    await queryInterface.removeColumn('diligence_reports', 'assignedDate');
    await queryInterface.removeColumn('diligence_reports', 'rejectionReason');
  }
};
