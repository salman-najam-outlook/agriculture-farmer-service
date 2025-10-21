'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('risk_mitigation_files', 'deprecated_production_place_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'due_diligence_production_places',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('risk_mitigation_files', 'deprecated_production_place_id');
  },
};
