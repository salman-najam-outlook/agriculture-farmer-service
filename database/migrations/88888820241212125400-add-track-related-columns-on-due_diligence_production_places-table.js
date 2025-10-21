'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'due_diligence_production_places',
        'latestGeofenceId',
        {
          type: Sequelize.INTEGER,
          references: {
            model: 'geofences',
            key: 'id',
          },
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'due_diligence_production_places',
        'productionPlaceDeforestationInfoId',
        {
          type: Sequelize.BIGINT({ unsigned: true }),
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addConstraint('due_diligence_production_places', {
        type: 'foreign key',
        fields: ['productionPlaceDeforestationInfoId'],
        references: {
          table: 'production_place_deforestation_info',
          field: 'id',
        },
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        name: 'production_place_deforestation_info_fk',
        transaction,
      });
      await queryInterface.addColumn(
        'due_diligence_production_places',
        'deletedAt',
        {
          type: Sequelize.DATE,
          allowNull: true,
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('due_diligence_production_places', 'latestGeofenceId', { transaction });
      await queryInterface.removeColumn('due_diligence_production_places', 'productionPlaceDeforestationInfoId', {
        transaction,
      });
      await queryInterface.removeColumn('due_diligence_production_places', 'deletedAt', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
