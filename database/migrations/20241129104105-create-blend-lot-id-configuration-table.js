'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('blend_product_lot_id_generators', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      blend_setting_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'blend_settings',
          key: 'id',
        },
      },
      separator: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      start_count: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      reset: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      preview_lot_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      type_first: {
        type: Sequelize.ENUM('Static Text', 'Incremental Number', 'Year', 'Month', 'Date'),
        allowNull: true,
      },
      type_second: {
        type: Sequelize.ENUM('Static Text', 'Incremental Number', 'Year', 'Month', 'Date'),
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      month: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      resetFrequency: {
        type: Sequelize.ENUM('None', 'Year', 'Month'),
        allowNull: false,
        defaultValue: 'None',
        comment: 'Specifies the reset frequency: None, Year, or Month',
      },
      
      static_text: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
      },

      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('blend_product_lot_id_generators');
  },
};
