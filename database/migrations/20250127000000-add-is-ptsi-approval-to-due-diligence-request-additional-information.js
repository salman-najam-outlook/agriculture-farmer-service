'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn(
      'due_diligence_request_additional_information',
      'isPtsiApproval',
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
        comment: 'Flag to indicate if this is a PTSI approval request'
      }
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn(
      'due_diligence_request_additional_information',
      'isPtsiApproval'
    );
  }
};
