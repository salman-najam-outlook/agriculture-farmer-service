"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "userlivestock_farm",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        farm: {
          type: Sequelize.INTEGER,
          references: {
            model: "user_farms",
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
            fields: ["farm", "userLiveStock"],
          },
        ],
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("userlivestock_farm");
  },
};
