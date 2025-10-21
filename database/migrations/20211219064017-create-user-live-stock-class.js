"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "userlivestock_class",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        class: {
          type: Sequelize.INTEGER,
          references: {
            model: "livestock_class",
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
            fields: ["class", "userLiveStock"],
          },
        ],
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("userlivestock_class");
  },
};
