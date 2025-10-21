'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('geofences', 'is_deleted', {
      allowNull: false,
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('geofences', 'is_deleted');
  }
};
