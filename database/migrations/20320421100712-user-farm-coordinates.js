"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_farm_coordinates", {
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
      farmId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "user_farms",
          key: "syncId",
        },
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
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
    await queryInterface.dropTable("user_farm_coordinates");
  },
};
