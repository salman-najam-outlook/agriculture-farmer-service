'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    try {
      await queryInterface.addColumn('solana_transactions', 'status', {
        type: Sequelize.STRING(20),
        allowNull: true,
        defaultValue: 'processing'
      });

      // Optional: Add indexes if needed
      await queryInterface.addIndex('solana_transactions', ['status'], {
        name: 'idx_solana_transactions_status'
      });

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  },

  async down (queryInterface, Sequelize) {
    try {
      // First remove any indexes if they exist
      await queryInterface.removeIndex('solana_transactions', 'idx_solana_transactions_status');
      
      // Then remove the column
      await queryInterface.removeColumn('solana_transactions', 'status');
    } catch (error) {
      console.error('Migration rollback failed:', error);
      throw error;
    }
  }
};
