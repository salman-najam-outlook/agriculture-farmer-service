'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('manage_products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      hsCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      eudrDocumentCode: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      s3Key: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      orgId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "organization",
          key: "id"
        }
      },
      
      productType: {
        type: Sequelize.ENUM("global","internal"),
        allowNull: true,
        defaultValue: "internal",
      },

      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "users_dds",
          key: "id"
        },
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
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('manage_products');
  }
};
