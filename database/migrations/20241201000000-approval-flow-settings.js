'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('approval_flow_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'org_id'
      },
      approval_expiration_period: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'approval_expiration_period',
        validate: {
          min: 1,
          max: 365
        }
      },
      approval_expiration_unit: {
        type: Sequelize.ENUM('days', 'weeks', 'months'),
        allowNull: true,
        field: 'approval_expiration_unit',
        defaultValue: 'days'
      },
      document_visibility: {
        type: Sequelize.ENUM('private', 'cooperative_and_ptsi_only', 'public'),
        allowNull: true,
        field: 'document_visibility',
        defaultValue: 'private'
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        field: 'is_default',
        defaultValue: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'created_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        field: 'updated_at',
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });

    // Add indexes for better performance
    await queryInterface.addIndex('approval_flow_settings', ['org_id'], {
      name: 'idx_approval_flow_settings_org_id'
    });

    await queryInterface.addIndex('approval_flow_settings', ['is_default'], {
      name: 'idx_approval_flow_settings_is_default'
    });

  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('approval_flow_settings', 'idx_approval_flow_settings_org_id');
    await queryInterface.removeIndex('approval_flow_settings', 'idx_approval_flow_settings_is_default');

    await queryInterface.dropTable('approval_flow_settings');

    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_approval_flow_settings_approval_expiration_unit;');
    await queryInterface.sequelize.query('DROP TYPE IF EXISTS enum_approval_flow_settings_document_visibility;');
  }
};
