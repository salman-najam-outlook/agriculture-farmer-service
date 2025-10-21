'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable('geofences', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: { type: Sequelize.INTEGER, allowNull: true },
      farmId: { type: Sequelize.INTEGER, allowNull: true },
      geofenceName: { type: Sequelize.STRING, allowNull: true },
      farmAddress: { type: Sequelize.TEXT },
      geofenceArea: { type: Sequelize.FLOAT, allowNull: true },
      geofenceAreaUOMId: { type: Sequelize.INTEGER, allowNull: true },
      geofenceParameter: { type: Sequelize.FLOAT, allowNull: true },
      geofenceParameterUOMId: { type: Sequelize.INTEGER, allowNull: true },
      walkAndMeasure: { type: Sequelize.INTEGER, allowNull: true },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('geofences');
  }
};
