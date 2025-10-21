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
    await queryInterface.createTable('shipments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      exporter: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      importer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipment_refrence_number: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      ownership_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      buyer: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      part_of_origin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      part_of_destination: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      shipping_line: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      expected_arrival_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      container_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      container_type: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      container_size: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      container_capacity: {
        type: Sequelize.FLOAT,
        allowNull: true,
      },
      organization_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable('shipments');
  }
};
