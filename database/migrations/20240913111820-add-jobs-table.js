'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable(
        'jobs',
        {
          id: {
            type: Sequelize.BIGINT.UNSIGNED,
            primaryKey: true,
            autoIncrement: true,
          },
          payload: {
            type: Sequelize.JSON,
            allowNull: false,
          },
          modelType: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          modelId: {
            type: Sequelize.STRING,
            allowNull: true,
          },
          availableAttempts: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0,
          },
          reservedAt: {
            type: Sequelize.DATE,
            allowNull: true,
          },
          availableAt: {
            type: Sequelize.DATE,
            allowNull: false,
          },
          status: {
            type: Sequelize.ENUM('PROCESSING', 'COMPLETED', 'FAILED', 'PENDING'),
            allowNull: false,
            defaultValue: 'PENDING',
          },
          context: {
            type: Sequelize.JSON,
            allowNull: true,
          },
          priority: {
            type: Sequelize.INTEGER.UNSIGNED,
            allowNull: false,
            defaultValue: 0
          },
          createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
          },
          updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.fn('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
          },
        },
        {
          transaction,
        }
      );
      await queryInterface.addIndex('jobs', {
        fields: ['modelType', 'modelId'],
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('jobs');
  },
};
