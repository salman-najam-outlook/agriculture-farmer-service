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
    await queryInterface.createTable('eudr_settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      org_id: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      radius_unit: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      radius_max_limit: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      isDefault: {
        allowNull:false,
        type: Sequelize.BOOLEAN,
      },
      product_mass_unit: {
        allowNull: false,
        type: Sequelize.STRING, 
      },
      volume_unit: {
        allowNull: false,
        type: Sequelize.STRING, 
      },
      user_type: {
        allowNull: false,
        type: Sequelize.ENUM('operator', 'supplier'), 
      },
      risk_mitigation_level_id: {
        allowNull: false,
        type: Sequelize.INTEGER, 
        // references: {
        //   model: 'risk_levels',
        //   key: 'id'
        // }
      },
      eudr_api_key: {
        allowNull: false,
        type: Sequelize.STRING, 
      },
      eudr_api_secret: {
        allowNull: false,
        type: Sequelize.STRING, 
      },
      dynamicExpiryTime: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      dynamicExpiryTimePeriod: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      toggleAutoRenewWhenReportAdded: {
        allowNull: false,
        type: Sequelize.ENUM('auto', 'autoWhenAdded'), 
      },
      declarationStatementCountry: {
        allowNull: false,
        type: Sequelize.STRING
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
    })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('eudr_settings')
  }
};
