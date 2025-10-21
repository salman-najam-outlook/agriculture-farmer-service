'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('diligence_reports_transactions', {
      id: {
        type: Sequelize.BIGINT.UNSIGNED,
        primaryKey: true,
        autoIncrement: true,
      },
      diligenceReportId: {
        type: Sequelize.INTEGER,
        references: {
          key: 'id',
          model: 'diligence_reports',
        },
        allowNull: true,
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      },
      transactionHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      keccakHash: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      s3Key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_transactions');
  }
};
