'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction((transaction) => {
      return Promise.all([
        queryInterface.bulkUpdate(
          'deforestation_report_requests',
          {
            highProbColor: '#F03737',
            highProbColorName: 'Red',
            lowProbColor: '#FFB443',
            lowProbColorName: 'Yellow',
            zeroProbColor: '#F1F4F7',
            zeroProbColorName: 'Transparent',
          },
          {
            lowProb: { [Sequelize.Op.not]: null },
            highProb: { [Sequelize.Op.not]: null },
            zeroProb: { [Sequelize.Op.not]: null },
            veryHighProb: { [Sequelize.Op.is]: null },
            veryLowProb: { [Sequelize.Op.is]: null },
            mediumProb: { [Sequelize.Op.is]: null },
          },
          { transaction }
        ),
        queryInterface.bulkUpdate(
          'deforestation_report_requests',
          {
            veryHighProbColor: '#8B0000',
            veryHighProbColorName: 'Dark Red',
            highProbColor: '#F03737',
            highProbColorName: 'Red',
            mediumProbColor: '#FFA520',
            mediumProbColorName: 'Orange',
            lowProbColor: '#60dbdb',
            lowProbColorName: 'Light Blue',
            veryLowProbColor: '#208080',
            veryLowProbColorName: 'Teal',
            zeroProbColor: '#F1F4F7',
            zeroProbColorName: 'Transparent',
          },
          {
            veryHighProb: { [Sequelize.Op.not]: null },
            veryLowProb: { [Sequelize.Op.not]: null },
            mediumProb: { [Sequelize.Op.not]: null },
          },
          { transaction }
        ),
      ]);
    });
  },

  async down(queryInterface, Sequelize) {},
};
