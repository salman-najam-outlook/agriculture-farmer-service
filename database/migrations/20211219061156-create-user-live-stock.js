"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("user_livestock", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      displayName: {
        type: Sequelize.STRING,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
      },
      livestock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "livestock",
          key: "id",
        },
      },
      breed: {
        type: Sequelize.INTEGER,
        references: {
          model: "livestock_breed",
          key: "id",
        },
      },
      stage: {
        type: Sequelize.INTEGER,
        references: {
          model: "livestock_stage",
          key: "id",
        },
      },
      dam: {
        type: Sequelize.INTEGER,
        references: {
          model: "user_livestock",
          key: "id",
        },
      },
      surrogate: {
        type: Sequelize.INTEGER,
        references: {
          model: "user_livestock",
          key: "id",
        },
      },
      sire: {
        type: Sequelize.INTEGER,
        references: {
          model: "user_livestock",
          key: "id",
        },
      },
      tagNumber: {
        type: Sequelize.STRING,
      },
      identificationNumber: {
        type: Sequelize.STRING,
      },
      gender: {
        type: Sequelize.ENUM({
          values: ["male", "female", "other"],
        }),
      },
      dateOfBirth: {
        type: Sequelize.DATE,
      },
      weight: {
        type: Sequelize.DECIMAL,
      },
      group: {
        type: Sequelize.INTEGER,
        references: {
          model: "livestock_group",
          key: "id",
        },
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    await queryInterface.dropTable("user_livestock");
  },
};
