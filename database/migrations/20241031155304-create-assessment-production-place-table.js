'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('assessment_production_place', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      diligenceReportId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'diligence_reports',
          key: 'id'
        },
      },

      productionPlaceId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'due_diligence_production_places',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      assessmentId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'assessments',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        allowNull: false,
      },
      assessmentResponseId: {
        type: Sequelize.STRING,
        allowNull: true
      },
      riskAssessmentStatus: {
        type: Sequelize.STRING,
        allowNull: true
      },
      s3Key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      s3Location: {
        type: Sequelize.STRING,
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      expiryDate: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    })
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
