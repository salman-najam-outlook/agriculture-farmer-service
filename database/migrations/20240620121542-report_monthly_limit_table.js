'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("reports_monthly_limits", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      organization_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'organization',
          key: 'id'
        },
        allowNull: false
      },
      report_type_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'reports_type',
          key: 'id'
        },
        allowNull: false
      },
      limit: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reports_monthly_limits');
  }
};
