'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blend_settings', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      blend_title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      blend_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      blend_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      final_product_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      final_product_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      process_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orgId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organization',
          key: 'id',
        },
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

  async down(queryInterface) {
    await queryInterface.dropTable('blend_settings');
  },
};
