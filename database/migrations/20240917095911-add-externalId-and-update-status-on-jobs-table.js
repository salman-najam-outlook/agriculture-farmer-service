'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'jobs',
        'externalId',
        {
          allowNull: true,
          type: Sequelize.STRING,
        },
        { transaction }
      );
      await queryInterface.addIndex(
        'jobs',
        {
          fields: ['externalId'],
        },
        { transaction }
      );
      await queryInterface.changeColumn(
        'jobs',
        'status',
        {
          type: Sequelize.ENUM('PROCESSING', 'COMPLETED', 'FAILED', 'PENDING', 'ON HOLD'),
          allowNull: false,
          defaultValue: 'PENDING',
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
      await queryInterface.removeColumn('jobs', 'externalId', { transaction });
      await queryInterface.changeColumn(
        'jobs',
        'status',
        {
          type: Sequelize.ENUM('PROCESSING', 'COMPLETED', 'FAILED', 'PENDING'),
          allowNull: false,
          defaultValue: 'PENDING',
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
