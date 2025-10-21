'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */

    await queryInterface.createTable("diligence_reports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      supplierId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      whoAddPlaceData: { type: Sequelize.ENUM(['operator', 'supplier']), allowNull: true },
      assessmentCountries: {
        allowNull: true,
        type: Sequelize.JSON
      },
      requiredAssessment: {
        allowNull: true,
        type: Sequelize.JSON
      },
      internalReferenceNumber: { type: Sequelize.STRING, allowNull: true },
      EUDRReferenceNumber: { type: Sequelize.STRING, allowNull: true },
      companyID: { type: Sequelize.STRING, allowNull: true },
      activity: { type: Sequelize.ENUM(['Domestic', 'Import', 'Export']), allowNull: true },
      countryOfActivity: { type: Sequelize.STRING, allowNull: true },
      countryOfEntry: { type: Sequelize.STRING, allowNull: true },

      product: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      subProduct: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      productDescription: { type: Sequelize.STRING, allowNull: true },
      productNetMass: { type: Sequelize.STRING, allowNull: true },
      productScientificName: { type: Sequelize.STRING, allowNull: true },
      productCommonName: { type: Sequelize.STRING, allowNull: true },
      productVolume: { type: Sequelize.STRING, allowNull: true },




      status: { type: Sequelize.STRING, allowNull: true },
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
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
