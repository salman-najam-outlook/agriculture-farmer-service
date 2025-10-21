'use strict';

const { createHash } = require('crypto');
const { QueryTypes } = require('sequelize');

const defaultToNonNull = (...values) => {
  return values.find((item) => item !== null && typeof item !== 'undefined' && !isNaN(item));
};

const generateHash = (value) => {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
};

const getCoordinateHash = (circularOrPolygonCoordinates) => {
  if (!circularOrPolygonCoordinates) return null;
  if (Array.isArray(circularOrPolygonCoordinates)) {
    const cleanCoordinates = [];
    circularOrPolygonCoordinates.forEach((coordinate) => {
      const lng = Number(defaultToNonNull(coordinate.lng, coordinate.log));
      const lat = Number(coordinate.lat);
      const newCoordinate = [Number(lng.toFixed(6)), Number(lat.toFixed(6))];
      if (cleanCoordinates.length) {
        const previousCoordinate = cleanCoordinates[cleanCoordinates.length - 1];
        if (previousCoordinate[0] !== newCoordinate[0] || previousCoordinate[1] !== newCoordinate[1]) {
          cleanCoordinates.push(newCoordinate);
        }
      } else {
        cleanCoordinates.push(newCoordinate);
      }
    });

    const isLastAndFirstSame =
      cleanCoordinates[0][0] === cleanCoordinates[cleanCoordinates.length - 1][0] &&
      cleanCoordinates[0][1] === cleanCoordinates[cleanCoordinates.length - 1][1];
    if (isLastAndFirstSame) cleanCoordinates.pop();

    let sortIdx = 0;
    for (let i = 1; i < cleanCoordinates.length; i++) {
      if (
        cleanCoordinates[i][0] < cleanCoordinates[sortIdx][0] ||
        (cleanCoordinates[i][0] === cleanCoordinates[sortIdx][0] &&
          cleanCoordinates[i][1] < cleanCoordinates[sortIdx][1])
      ) {
        sortIdx = i;
      }
    }

    cleanCoordinates.push(...cleanCoordinates.splice(0, sortIdx));
    cleanCoordinates.push(cleanCoordinates[0]);
    return generateHash(cleanCoordinates);
  } else {
    const lng = Number(
      defaultToNonNull(
        circularOrPolygonCoordinates.lng,
        circularOrPolygonCoordinates.log,
        circularOrPolygonCoordinates.geofenceCenterLog
      )
    );
    const lat = Number(
      defaultToNonNull(circularOrPolygonCoordinates.lat, circularOrPolygonCoordinates.geofenceCenterLat)
    );
    const radius = Number(
      defaultToNonNull(circularOrPolygonCoordinates.radius, circularOrPolygonCoordinates.geofenceRadius)
    );
    const newCoordinate = [Number(lng.toFixed(6)), Number(lat.toFixed(6)), radius];
    return generateHash(newCoordinate);
  }
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const geofences = await queryInterface.sequelize.query(
        `
        SELECT id, geofenceCenterLat, geofenceCenterLog, geofenceRadius FROM geofences g WHERE g.coordinateHash IS NULL
        `,
        {
          type: QueryTypes.SELECT,
        }
      );
      const circularGeofences = geofences.filter((geofence) => {
        return (
          geofence.geofenceCenterLat !== null && geofence.geofenceCenterLog !== null && geofence.geofenceRadius !== null
        );
      });

      const polygonGeofenceIds = geofences
        .filter((geofence) => !circularGeofences.includes(geofence))
        .map((geofence) => geofence.id);

      const polygonGeofenceCoordinates = await queryInterface.sequelize.query(
        `
        SELECT * FROM geofence_coordinates WHERE geofenceId IN (:polygonGeofenceIds)
      `,
        {
          type: QueryTypes.SELECT,
          replacements: { polygonGeofenceIds },
        }
      );

      const polygonGeofences = {};
      for (const polygonGeofenceCoordinate of polygonGeofenceCoordinates) {
        if (polygonGeofences[polygonGeofenceCoordinate.geofenceId]) {
          polygonGeofences[polygonGeofenceCoordinate.geofenceId].push(polygonGeofenceCoordinate);
        } else {
          polygonGeofences[polygonGeofenceCoordinate.geofenceId] = [polygonGeofenceCoordinate];
        }
      }

      console.log('---------------------------------------------------------');
      console.log('Begining Circular Geofence Hash Seed');
      console.log('---------------------------------------------------------');
      await Promise.all(
        circularGeofences.map((geofence) => {
          const hash = getCoordinateHash(geofence);
          return queryInterface.sequelize.query(
            `
          UPDATE geofences SET coordinateHash = :hash WHERE id = :id
        `,
            {
              type: QueryTypes.UPDATE,
              replacements: { hash, id: geofence.id },
            }
          );
        })
      );
      console.log('---------------------------------------------------------');
      console.log('Completed Circular Geofence Hash Seed. Total: ' + circularGeofences.length);
      console.log('---------------------------------------------------------');

      console.log('---------------------------------------------------------');
      console.log('Begining Polygon Geofence Hash Seed');
      console.log('---------------------------------------------------------');
      await Promise.all(
        Object.keys(polygonGeofences).map((id) => {
          const hash = getCoordinateHash(polygonGeofences[id]);
          return queryInterface.sequelize.query(
            `
          UPDATE geofences SET coordinateHash = :hash WHERE id = :id
        `,
            {
              type: QueryTypes.UPDATE,
              replacements: { hash, id },
            }
          );
        })
      );
      console.log('---------------------------------------------------------');
      console.log('Completed Polygon Geofence Hash Seed. Total: ' + Object.keys(polygonGeofences).length);
      console.log('---------------------------------------------------------');
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`UPDATE geofences SET coordinateHash = NULL`, { type: QueryTypes.UPDATE });
  },
};
