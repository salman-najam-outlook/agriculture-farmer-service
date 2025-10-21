'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable('global_translation_metadata', {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
        },
        english: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        hindi: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        marathi: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        nepali: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        spanish: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        swahili: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        indonesian: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        french: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        portugese: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        arabic: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        bengali: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        oromo: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        somali: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        vietnamese: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        amharic: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        greek: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        mandarin: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        turkish: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        japanese: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        dutch: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        italian: {
          type: Sequelize.STRING(255),
          allowNull: true,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        }
      }, { transaction });

      // Commit the transaction after successful table creation
      await transaction.commit();
    } catch (err) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      throw err; // Rethrow the error to stop the migration
    }
  },

  down: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.dropTable('global_translation_metadata', { transaction });

      // Commit the transaction after successful table deletion
      await transaction.commit();
    } catch (err) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      throw err; // Rethrow the error to stop the migration
    }
  }
};
