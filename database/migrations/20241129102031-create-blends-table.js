'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('dds_blends', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      net_mass: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
      },
      blend_lot_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      finished_product_lot_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blend_setting_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'blend_settings',
          key: 'id',
        },
      },
      blend_code: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      internal_reference_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      eudr_reference_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orgId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organization',
          key: 'id'
        }
      },
      country_of_entry: {
        type: Sequelize.JSON,
        allowNull: true,
      },

      country_of_activity: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      activity: {
        type: Sequelize.ENUM(['Domestic', 'Import', 'Export']), allowNull: true
      },
      continue_later: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: true,
      },

      blend_status: {
        type: Sequelize.ENUM(
          'pending',
          'compliant',
          'non-compliant',
          'uploaded-to-eu-portal'
        ),
        allowNull: false,
        defaultValue: 'pending',
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('dds_blends');
  }
};
