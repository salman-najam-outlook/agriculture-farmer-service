'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.addColumn(
      'diligence_reports',
      'comments',
      {
        allowNull: true,
        type: Sequelize.STRING
      },
    );

    await queryInterface.addColumn(
      'diligence_reports',
      'eudrVerificationNo',
      {
        allowNull: true,
        type: Sequelize.STRING
      },
    );


    await queryInterface.addColumn(
      'diligence_reports',
      'isGeolocationPrivate',
      {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
    );
   
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
