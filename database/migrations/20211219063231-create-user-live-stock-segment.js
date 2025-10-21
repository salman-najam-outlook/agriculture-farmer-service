"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "userlivestock_segment",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        segment: {
          type: Sequelize.INTEGER,
          references: {
            model: "geofences",
            key: "id",
          },
        },
        userLiveStock: {
          type: Sequelize.INTEGER,
          references: {
            model: "user_livestock",
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
      },
      {
        indexes: [
          {
            unique: true,
            fields: ["segment", "userLiveStock"],
          },
        ],
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("userlivestock_segment");
  },
};
