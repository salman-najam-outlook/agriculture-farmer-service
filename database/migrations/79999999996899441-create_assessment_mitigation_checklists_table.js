'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('assessment_question_mitigation_checklists', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        assessmentMitigationId: { type: Sequelize.INTEGER, allowNull: false },
        checklistTitle: { type: Sequelize.STRING, allowNull: true },
        isChecked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
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
    await queryInterface.dropTable('assessment_question_mitigation_checklists');
  },
};
