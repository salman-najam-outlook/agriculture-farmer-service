'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('deforestation_report_requests', 'originalOverallProb', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.sequelize.query(`UPDATE deforestation_report_requests SET originalOverallProb = overallProb`);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('deforestation_report_requests', 'originalOverallProb');
  },
};
