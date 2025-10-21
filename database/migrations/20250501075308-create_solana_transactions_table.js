'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('solana_transactions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT({ unsigned: true }),
      },

      transactionSignature: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      transactableType: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      transactableId: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      attempts: {
        allowNull: false,
        type: Sequelize.SMALLINT({ unsigned: true }),
        defaultValue: 1,
      },

      isSuccess: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },

      error: {
        allowNull: true,
        type: Sequelize.JSON,
      },

      transactionDate: {
        allowNull: true,
        type: Sequelize.DATE,
      },

      transactionFee: {
        allowNull: true,
        type: Sequelize.INTEGER({ unsigned: true }),
      },

      transactionData: {
        allowNull: false,
        type: Sequelize.JSON,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('solana_transactions');
  },
};
