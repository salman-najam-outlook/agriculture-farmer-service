'use strict';

const { QueryTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productionPlaceToGeofenceMap = await queryInterface.sequelize.query(
      `
        SELECT ddpp.id as productionPlaceId, g.id as geofenceId FROM due_diligence_production_places ddpp
        INNER JOIN geofences g
        ON g.farmId = ddpp.farmId AND g.isPrimary = 1
        WHERE ddpp.latestGeofenceId IS NULL
      `,
      {
        type: QueryTypes.SELECT,
      }
    );
    await Promise.all(
      productionPlaceToGeofenceMap.map((item) => {
        return queryInterface.sequelize.query(
          `
            UPDATE due_diligence_production_places SET latestGeofenceId = :geofenceId WHERE id = :productionPlaceId        
          `,
          {
            type: QueryTypes.UPDATE,
            replacements: item,
          }
        );
      })
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.update(
      `
      UPDATE due_diligence_production_places SET latestGeofenceId = NULL
      `,
      {
        type: QueryTypes.UPDATE,
      }
    );
  },
};
