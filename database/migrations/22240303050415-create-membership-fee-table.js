'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('membership_fees', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      membership_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "memberships",
          key: "id",
        },
      },
      per_month_fee: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      per_year_fee: {
        allowNull: false,
        type: Sequelize.FLOAT
      },
      is_free_trial: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      free_trial_period_in_days: {
        allowNull: true,
        type: Sequelize.INTEGER,
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
 
      description: {
        allowNull: true,
        type: Sequelize.STRING
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
    await queryInterface.dropTable('membership_fees');
  }
};
