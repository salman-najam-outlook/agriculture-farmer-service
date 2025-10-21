'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blend_setting_products', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      blend_setting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'blend_settings',
          key: 'id',
        },
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'manage_products',
          key: 'id',
        },
      },
      sub_product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'manage_subproducts',
          key: 'id',
        },
      },
      origin_country_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      percentage: {
        type: Sequelize.FLOAT,
        allowNull: true,
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
    await queryInterface.dropTable('blend_setting_products');
  },
};
