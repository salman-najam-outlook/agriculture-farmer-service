'use strict';

/** @type {import('sequelize-cli').Migration} */
const translationData = require('../seeders/translationData');

module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkInsert('global_translation_metadata', translationData, { transaction });
      await transaction.commit();
    } catch (error) {
      console.log(error);
      await transaction.rollback();
    }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.bulkDelete('global_translation_metadata', null, { transaction });
      await transaction.commit();
    } catch (error) {
      console.log(error);
      await transaction.rollback();
    }
  }
};