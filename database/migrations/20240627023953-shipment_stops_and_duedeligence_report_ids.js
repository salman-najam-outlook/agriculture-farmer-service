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
      await queryInterface.createTable('shipment_stops', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        shipment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'shipments',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        title: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });

      await queryInterface.createTable('shipment_due_deligence_report', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
          primaryKey: true,
        },
        shipment_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'shipments',
            key: 'id',
          },
          onDelete: 'CASCADE',
        },
        due_deligence_report_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        createdAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        updatedAt: {
          type: Sequelize.DATE,
          allowNull: false,
        },
      });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('shipment_stops');
    await queryInterface.dropTable('shipment_due_deligence_report');
    
  }
};
