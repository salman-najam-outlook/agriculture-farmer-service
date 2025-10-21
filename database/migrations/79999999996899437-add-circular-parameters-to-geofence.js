"use strict";

const columns = ["geofenceRadius", "geofenceCenterLat", "geofenceCenterLog"];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await Promise.all(
      columns.map((column) => {
        queryInterface.addColumn("geofences", column, {
          type: Sequelize.STRING,
          allowNull: true,
        });
      })
    );

    await queryInterface.addColumn("geofences", "isPrimary", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await Promise.all(
      columns.map((column) => {
        queryInterface.removeColumn("geofences", column);
      })
    );
  },
};
