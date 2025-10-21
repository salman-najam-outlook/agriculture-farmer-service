'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('report_assessment', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      diligence_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'diligence_reports',
          key: 'id'
        },
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users_dds',
          key: 'id'
        },
        allowNull: false
      },
      assessment_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'assessments',
          key: 'id'
        },
        allowNull: false
      },
      existing_survey : {
        type: Sequelize.STRING,//existing_survey
        allowNull: true
      },
      placement : {
        type: Sequelize.STRING,//one_for_all || one_for_each
        allowNull: true
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      }
     
    });
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
