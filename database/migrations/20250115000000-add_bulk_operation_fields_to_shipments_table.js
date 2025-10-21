'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add new columns to shipments table for bulk operations
    await queryInterface.addColumn('shipments', 'statusLegends', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'JSON object containing status legends for the shipment'
    });
    
    await queryInterface.addColumn('shipments', 'isTemporaryApproval', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false
    });
    
    await queryInterface.addColumn('shipments', 'temporaryExpirationDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('shipments', 'temporaryExpirationValue', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
    
    await queryInterface.addColumn('shipments', 'temporaryExpirationUnit', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('shipments', 'assignedTo', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('shipments', 'assignedToCfId', {
      type: Sequelize.STRING,
      allowNull: true
    });
    
    await queryInterface.addColumn('shipments', 'assignedDate', {
      type: Sequelize.DATE,
      allowNull: true
    });
    
    await queryInterface.addColumn('shipments', 'rejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('shipments', 'rejectionReason');
    await queryInterface.removeColumn('shipments', 'assignedDate');
    await queryInterface.removeColumn('shipments', 'assignedToCfId');
    await queryInterface.removeColumn('shipments', 'assignedTo');
    await queryInterface.removeColumn('shipments', 'temporaryExpirationUnit');
    await queryInterface.removeColumn('shipments', 'temporaryExpirationValue');
    await queryInterface.removeColumn('shipments', 'temporaryExpirationDate');
    await queryInterface.removeColumn('shipments', 'isTemporaryApproval');
    await queryInterface.removeColumn('shipments', 'statusLegends');
  }
};