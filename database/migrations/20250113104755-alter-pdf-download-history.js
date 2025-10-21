'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("pdf_download_histories", "pdfType", {
      type: Sequelize.STRING,
      allowNull: true,
      after: "dueDiligenceReportId"
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("pdf_download_histories", "pdfType");
  }
};
