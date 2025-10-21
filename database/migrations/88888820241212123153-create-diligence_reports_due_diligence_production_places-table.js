'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('diligence_reports_due_diligence_production_places', {
      id: {
        primaryKey: true,
        type: Sequelize.BIGINT({ unsigned: true }),
        autoIncrement: true,
      },
      farmId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'user_farms',
          key: 'id',
        },
        allowNull: false,
      },
      diligenceReportId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'diligence_reports',
          key: 'id',
        },
        allowNull: false,
      },
      dueDiligenceProductionPlaceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'due_diligence_production_places',
          key: 'id',
        },
        allowNull: false,
      },
      geofenceId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'geofences',
          key: 'id',
        },
        allowNull: false,
      },
      isDisregarded: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      warnings: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      removed: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      productionPlaceDeforestationInfoId: {
        type: Sequelize.BIGINT({ unsigned: true }),
        references: {
          model: 'production_place_deforestation_info',
          key: 'id',
        },
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('diligence_reports_due_diligence_production_places');
  },
};
