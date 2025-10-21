'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('user_farm_locations', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        address: { type: Sequelize.TEXT },
        area: { type: Sequelize.STRING, allowNull: true },
        recordId: { type: Sequelize.STRING, allowNull: true },
        city: { type: Sequelize.STRING, allowNull: true },
        areaUomId: { type: Sequelize.FLOAT, allowNull: true },
        country: { type: Sequelize.STRING, allowNull: true },
        farmNumber: { type: Sequelize.STRING, allowNull: true },
        lat: { type: Sequelize.DOUBLE, allowNull: true },
        log: { type: Sequelize.DOUBLE, allowNull: true },
        parameter: { type: Sequelize.FLOAT, allowNull: true },
        state: { type: Sequelize.STRING, allowNull: true },
        street: { type: Sequelize.STRING, allowNull: true },
        userId: { type: Sequelize.INTEGER, allowNull: true },
        farmId: { type: Sequelize.INTEGER, allowNull: true },
        isPrimary: {
          type: Sequelize.TINYINT,
          allowNull: true,
        },
        isDeleted: {
          type: Sequelize.TINYINT,
          allowNull: false,
          defaultValue: 0,
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
            'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
          ),
        },
      });
    } catch (error) {
      console.log(error, 'err');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_farm_locations');
  },
};
