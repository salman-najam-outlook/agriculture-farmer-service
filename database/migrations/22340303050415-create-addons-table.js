'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('add_ons', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING
      },
      per_month_fee: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      per_year_fee: {
        allowNull: false,
        type: Sequelize.FLOAT,
        defaultValue: 0
      },
      default_status: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      in_use: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      add_on_details: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      organization: {
        allowNull: true,
        type: Sequelize.INTEGER
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

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('add_ons');
  }
};
