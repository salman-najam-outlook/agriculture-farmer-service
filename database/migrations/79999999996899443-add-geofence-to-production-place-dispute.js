'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'production_place_disputes',
      'geofence_id',
      {
        allowNull: false,
        type: Sequelize.INTEGER,
        references: {
          model: 'geofences',
          key: 'id',
        },
        onDelete: "CASCADE"
      },
    );
  },

  down: async (queryInterface, Sequelize) => {

  },
};