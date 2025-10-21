"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("geofence_coordinates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      lat: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      log: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      geofenceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "geofences",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("geofence_coordinates");
  },
};
