'use strict';

const colorColumns = [
  'veryHighProbColor',
  'veryHighProbColorName',
  'highProbColor',
  'highProbColorName',
  'mediumProbColor',
  'mediumProbColorName',
  'lowProbColor',
  'lowProbColorName',
  'veryLowProbColor',
  'veryLowProbColorName',
  'zeroProbColor',
  'zeroProbColorName',
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all(
        colorColumns.map((column) =>
          queryInterface.addColumn(
            'deforestation_report_requests',
            column,
            {
              type: Sequelize.STRING,
              allowNull: true,
            },
            { transaction }
          )
        )
      );
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all(
        colorColumns.map((column) =>
          queryInterface.removeColumn('deforestation_report_requests', column, { transaction })
        )
      );
    });
  },
};
