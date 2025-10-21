'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('assessment_question_mitigation_discussions', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        assessmentMitigationId: { type: Sequelize.INTEGER, allowNull: false },
        comment: { type: Sequelize.STRING, allowNull: true },
        userId: { type: Sequelize.INTEGER, allowNull: false },
        deletedAt: {
          allowNull: true,
          type: Sequelize.DATE,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn(
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          ),
        },
      });
    } catch (error) {
      console.log(error, 'err');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('assessment_question_mitigation_discussions');
  },
};
