'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'geofences',
        'coordinateHash',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addIndex('geofences', ['coordinateHash'], {
        transaction,
      });
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('geofences', 'coordinateHash');
  },
};
