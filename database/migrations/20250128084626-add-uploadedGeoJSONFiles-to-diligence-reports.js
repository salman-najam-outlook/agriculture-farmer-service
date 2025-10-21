'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('diligence_reports', 'uploadedGeoJSONFiles', {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('diligence_reports', 'uploadedGeoJSONFiles');
  }
};