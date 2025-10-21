'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('hide_dds_report_from_blend_products', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false, 
      },
      blendId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'dds_blends',
          key: 'id',
        },
      },
      ddrId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "diligence_reports",
          key: "id",
        },
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
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('hide_dds_report_from_blend_products');
  }
};
