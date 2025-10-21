'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('blend_bulk_upload_history', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      location: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      originalFileName: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      s3FileKey: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      totalRecordsCount: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      failedRecordsCount: {
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      orgId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "organization",
          key: "id"
        }
      },
      createdBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        referenes: {
          model: "users_dds",
          key: "id"
        },
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
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('blend_bulk_upload_history');
  }
};
