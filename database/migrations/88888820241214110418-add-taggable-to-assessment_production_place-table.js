'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'assessment_production_place',
        'taggableType',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'assessment_production_place',
        'taggableId',
        {
          type: Sequelize.INTEGER({ unsigned: true }),
          allowNull: true,
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('assessment_production_place', 'taggableType', { transaction });
      await queryInterface.removeColumn('assessment_production_place', 'taggableId', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
