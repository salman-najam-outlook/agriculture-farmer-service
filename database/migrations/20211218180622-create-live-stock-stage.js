"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable(
      "livestock_stage",
      {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        livestock: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "livestock",
            key: "id",
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
      },
      {
        indexes: [
          {
            unique: true,
            fields: ["name", "livestock", "userId"],
          },
        ],
      }
    );
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("livestock_stage");
  },
};
