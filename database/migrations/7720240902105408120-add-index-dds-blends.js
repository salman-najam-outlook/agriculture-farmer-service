'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('blend_products',
      'index',
      {
        allowNull: true,
        type: Sequelize.INTEGER
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropColumn(
      'blend_products','index',
    );
  },
};
