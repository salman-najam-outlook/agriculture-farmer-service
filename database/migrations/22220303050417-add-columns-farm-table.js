'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('user_farms', 'parameterUomId', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'farmType', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('user_farms', 'areaUomId', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'productionSystem', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('user_farms', 'farmOwner', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.addColumn('user_farms', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'state', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'city', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'govRegistrationNum', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'contractMating', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'cooperativeId', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'licenceNum', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'licenceExpiryDate', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'regulatorName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'houseNum', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'street', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('user_farms', 'regulatorRepresentiveName', {
      type: Sequelize.STRING,
      allowNull: true,
    });
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
