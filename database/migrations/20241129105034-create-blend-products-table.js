'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blend_products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      blend_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dds_blends',
          key: 'id',
        },
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
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

      exempt_product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'exempt_products',
          key: 'id',
        },
      },

      product_type: {
        type: Sequelize.STRING,
        allowNull: false
      },

      ddr_id: {
        type: Sequelize.INTEGER,
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

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('blend_products');
  }
};
