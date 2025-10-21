'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('risk_levels', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      very_high: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      high: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      medium: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      low: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      zero: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      eudr_settings_id: {
        allowNull: false,
        type: Sequelize.INTEGER, 
        references: {
          model: 'eudr_settings',
          key: 'id'
        }
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
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('risk_levels')
  }
};
