'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('production_place_deforestation_info', 'originalDeforestationStatusForTemporaryApproval', {
      type: Sequelize.ENUM(
        'Manually Mitigated',
        'Very High Deforestation Probability',
        'High Deforestation Probability',
        'Medium Deforestation Probability',
        'Low Deforestation Probability',
        'Very Low Deforestation Probability',
        'Zero/Negligible Deforestation Probability'
      ),
      allowNull: true,
      comment: 'Stores the original deforestation status before temporary approval for reversion purposes'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('production_place_deforestation_info', 'originalDeforestationStatusForTemporaryApproval');
  }
};