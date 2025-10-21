'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'production_place_disputes',
        'deprecatedProductionPlaceId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        'production_place_disputes',
        {
          fields: ['deprecatedProductionPlaceId'],
          references: {
            table: 'due_diligence_production_places',
            field: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
          type: 'foreign key',
          name: 'dispute_deprecatedProductionPlaceId_fk',
          transaction,
        },
        { transaction }
      );
      await queryInterface.addColumn(
        'production_place_disputes',
        'deforestationReportRequestId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addConstraint('production_place_disputes', {
        fields: ['deforestationReportRequestId'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
        type: 'foreign key',
        references: {
          table: 'deforestation_report_requests',
          field: 'id',
        },
        name: 'dispute_deforestationReportRequestId_fk',
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.removeColumn('production_place_disputes', 'deprecatedProductionPlaceId', { transaction });
      await queryInterface.removeColumn('production_place_disputes', 'deforestationReportRequestId', { transaction });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
