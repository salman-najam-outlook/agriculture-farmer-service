'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('satellite_reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      locationName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      reportType: {
        type: Sequelize.STRING,
        allowNull: false
      },
      dateOfInterest: {
        allowNull: false,
        type: Sequelize.DATE
      },
      zoomLevel: {
        allowNull: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      centerLatitude : {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      centerLongitude : {
        type: Sequelize.DOUBLE,
        allowNull: true
      },
      sowingDate: {
        allowNull: true,
        type: Sequelize.DATE
      },
      harvestingDate: {
        allowNull: true,
        type: Sequelize.DATE
      },
      satelliteSource : {
        type: Sequelize.STRING,
        allowNull: true
      },
      inputImage: {
        type: Sequelize.STRING,
        allowNull: true
      },
      geoImagePath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      shortImagePath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      reportPDFPath: {
        type: Sequelize.STRING,
        allowNull: true
      },
      inputImgS3Key: {
        type: Sequelize.STRING,
        allowNull: true
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true
      },
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
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('satellite_reports');
  }
};