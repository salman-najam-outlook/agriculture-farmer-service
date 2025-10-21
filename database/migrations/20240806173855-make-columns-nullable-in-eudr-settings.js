'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.changeColumn('eudr_settings', 'radius_unit', {
      type: Sequelize.STRING,
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'radius_max_limit', {
      type: Sequelize.INTEGER,
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'isDefault', {
      type: Sequelize.BOOLEAN,
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'product_mass_unit', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'volume_unit', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'user_type', {
      type: Sequelize.ENUM('operator', 'supplier'), 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'risk_mitigation_level_id', {
      type: Sequelize.INTEGER, 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'eudr_api_key', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'eudr_api_secret', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'dynamicExpiryTime', {
      type: Sequelize.INTEGER,
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'dynamicExpiryTimePeriod', {
      type: Sequelize.STRING,
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'toggleAutoRenewWhenReportAdded', {
      type: Sequelize.ENUM('auto', 'autoWhenAdded'), 
      allowNull: true, 
    });

    await queryInterface.changeColumn('eudr_settings', 'declarationStatementCountry', {
      type: Sequelize.STRING,
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
