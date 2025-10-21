'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pdf_download_histories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      dueDiligenceReportId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'diligence_reports',
          key: 'id'
        }
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users_dds',
          key: 'id'
        }
      },

      orgId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "organization",
          key: 'id'
        }
      },

      estimatedTime: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      fileName: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      fileUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },

      status: {
        type: Sequelize.ENUM('completed', 'inprogress', 'failed'),
        defaultValue: 'inprogress',
        allowNull: false,
      },

      errorMessage: {
        type: Sequelize.TEXT('medium'),
        allowNull: true
      },

      completedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.NOW,
      },

      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('pdf_download_histories');
  }
};
