'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('exempt_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users_dds',
          key: 'id'
        }
      },
      internalReferenceNumber: { type: Sequelize.STRING, allowNull: true },
      activity: { type: Sequelize.ENUM(['Domestic', 'Import', 'Export']), allowNull: true },
      countryOfActivity: { type: Sequelize.JSON, allowNull: true },
      countryOfEntry: { type: Sequelize.STRING, allowNull: true },
      product: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'manage_products',
          key: 'id'
        }
      },
      subProduct: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'manage_subproducts',
          key: 'id'
        }
      },
      productNetMass: { type: Sequelize.STRING, allowNull: true },
      productVolume: { type: Sequelize.STRING, allowNull: true },
      productDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      availability: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      orgId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'organization',
          key: 'id',
        },
      },
      createdBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users_dds',
          key: 'id'
        },
        allowNull: false,
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('exempt_products');
  }
};
