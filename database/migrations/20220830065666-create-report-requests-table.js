'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('deforestation_report_requests', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      farm_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },

      user_id: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      location_name: {
        allowNull: false,
        type: Sequelize.STRING,
      },

      center_latitude: {
        allowNull: true,
        type: Sequelize.DOUBLE,
      },
      center_longitude: {
        allowNull: true,
        type: Sequelize.DOUBLE,
      },
      satelite_response: {
        allowNull: true,
        type: Sequelize.JSON,
      },
      is_deleted: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
        ),
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('deforestation_report_requests');
  },
};
