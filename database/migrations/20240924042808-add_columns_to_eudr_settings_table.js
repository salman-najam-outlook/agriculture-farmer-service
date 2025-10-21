'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {

    await queryInterface.addColumn('eudr_settings', 'public_geofence_download', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });

    await queryInterface.addColumn('eudr_settings', 'public_deforestation_summary', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('eudr_settings', 'public_geofence_download');
    await queryInterface.removeColumn('eudr_settings', 'public_deforestation_summary');
  }
};
