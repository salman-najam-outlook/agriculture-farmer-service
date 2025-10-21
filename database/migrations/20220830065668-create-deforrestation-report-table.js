'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('deforestation_satellite_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      report_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      report_request_id: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      satelite_source: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      image_name: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      image_path: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      img_s3_key: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('deforestation_satellite_reports');
  },
};
