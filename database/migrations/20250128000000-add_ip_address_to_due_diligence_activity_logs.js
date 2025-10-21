'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Add ip_address column to due_diligence_activity_logs table
    await queryInterface.addColumn('due_diligence_activity_logs', 'ip_address', {
      allowNull: true,
      type: Sequelize.STRING(45), // IPv4: 15 chars, IPv6: 39 chars, + buffer
      comment: 'IP address of the user who performed the action'
    });

    // Add index for better query performance when filtering by IP address
    await queryInterface.addIndex('due_diligence_activity_logs', ['ip_address'], {
      name: 'idx_due_diligence_activity_logs_ip_address'
    });

    // Add index for better query performance when filtering by user_id and ip_address
    await queryInterface.addIndex('due_diligence_activity_logs', ['user_id', 'ip_address'], {
      name: 'idx_due_diligence_activity_logs_user_ip'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remove the indexes first
    await queryInterface.removeIndex('due_diligence_activity_logs', 'idx_due_diligence_activity_logs_user_ip');
    await queryInterface.removeIndex('due_diligence_activity_logs', 'idx_due_diligence_activity_logs_ip_address');
    
    // Remove the ip_address column
    await queryInterface.removeColumn('due_diligence_activity_logs', 'ip_address');
  }
};
