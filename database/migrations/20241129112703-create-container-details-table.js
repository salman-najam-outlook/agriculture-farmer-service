'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('container_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      exemptProductId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "exempt_products",
          key: "id"
        }
      },
      blendId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "dds_blends",
          key: 'id'
        }
      },
      containerId: { type: Sequelize.STRING, allowNull: true },
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('container_details');
  },
};
