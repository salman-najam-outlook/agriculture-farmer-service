"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable("assessment_question_mitigation", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        dueDiligenceId: { type: Sequelize.INTEGER, allowNull: false },
        productionPlaceId: { type: Sequelize.INTEGER, allowNull: false },
        assessmentId: { type: Sequelize.INTEGER, allowNull: false },
        assessmentQuestionId: { type: Sequelize.INTEGER, allowNull: true },
        assessmentQuestionOptionId: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        mitigationStatus: { type: Sequelize.STRING, allowNull: true },
        assignedUserId: { type: Sequelize.INTEGER, allowNull: true },
        isDeleted: {
          type: Sequelize.BOOLEAN,
          allowNull: false,
          defaultValue: false,
        },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn(
            "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
          ),
        },
      });
    } catch (error) {
      console.log(error, "err");
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("assessment_question_mitigation");
  },
};
