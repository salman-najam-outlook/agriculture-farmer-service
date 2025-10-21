'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('memberships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      membership_name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      description: {
        allowNull: true,
        type: Sequelize.STRING
      },
      no_of_animals: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      satellite_report: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      pasture_report: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      other_report: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      plan_duration: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      plan_duration_unit: {
        allowNull: true,
        type: Sequelize.ENUM(['day(s)','week(s)','month(s)','year(s)']),
      },
      plan_duration_in_days: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      other_config: {
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
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('memberships');
  }
};
