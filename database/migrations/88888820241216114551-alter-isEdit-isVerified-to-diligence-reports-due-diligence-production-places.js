'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Define the new columns to be added
    const columnsToAdd = [
      {
        name: 'isEdit',
        options: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
      },
      {
        name: 'isVerified',
        options: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
      },
    ];

    // Add the new columns to the table
    for (const column of columnsToAdd) {
      await queryInterface.addColumn(
        'diligence_reports_due_diligence_production_places',
        column.name,
        column.options
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Define the columns to be removed
    const columnsToRemove = ['isEdit', 'isVerified'];

    // Remove the columns from the table
    for (const column of columnsToRemove) {
      await queryInterface.removeColumn(
        'diligence_reports_due_diligence_production_places',
        column
      );
    }
  },
};