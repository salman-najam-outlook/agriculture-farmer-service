'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'production_place_disputes',
      'status',
      {
        allowNull: false,
        type: Sequelize.ENUM(['OPEN', 'CLOSED', 'INFO_REQ']),
        defultValue: 'OPEN'
      },
    );
  },

  down: async (queryInterface, Sequelize) => {

  },
};