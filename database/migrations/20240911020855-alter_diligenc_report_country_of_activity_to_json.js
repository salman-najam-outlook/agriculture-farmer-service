'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
      try {
          await queryInterface.addColumn(
              'diligence_reports',
              'countryOfActivityBackup',
              {
                  type: Sequelize.STRING,
                  allowNull: true,
              },
              { transaction }
          );

          await queryInterface.sequelize.query(
              `
          UPDATE diligence_reports 
          SET countryOfActivityBackup = countryOfActivity
          WHERE countryOfActivity IS NOT NULL;
        `,
              { transaction }
          );

          await queryInterface.sequelize.query(
              `
          UPDATE diligence_reports 
          SET countryOfActivity = JSON_ARRAY(countryOfActivity)
          WHERE countryOfActivity IS NOT NULL;
        `,
              { transaction }
          );

          await queryInterface.changeColumn(
              'diligence_reports',
              'countryOfActivity',
              {
                  type: Sequelize.JSON,
                  allowNull: true,
              },
              { transaction }
          );

          await queryInterface.removeColumn(
              'diligence_reports',
              'countryOfActivityBackup',
              { transaction }
          );

          await transaction.commit();
      } catch (error) {
          await transaction.rollback();
          throw error;
      }
  },

  async down (queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
      try {
          await queryInterface.addColumn(
              'diligence_reports',
              'countryOfActivityBackup',
              {
                  type: Sequelize.STRING,
                  allowNull: true,
              },
              { transaction }
          );

          await queryInterface.sequelize.query(
              `
          UPDATE diligence_reports 
          SET countryOfActivityBackup = JSON_UNQUOTE(JSON_EXTRACT(countryOfActivity, '$[0]'))
          WHERE JSON_LENGTH(countryOfActivity) > 0;
        `,
              { transaction }
          );

          await queryInterface.changeColumn(
              'diligence_reports',
              'countryOfActivity',
              {
                  type: Sequelize.STRING,
                  allowNull: true,
              },
              { transaction }
          );

          await queryInterface.sequelize.query(
              `
          UPDATE diligence_reports 
          SET countryOfActivity = countryOfActivityBackup
          WHERE countryOfActivityBackup IS NOT NULL;
        `,
              { transaction }
          );

          await queryInterface.removeColumn(
              'diligence_reports',
              'countryOfActivityBackup',
              { transaction }
          );

          await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  }
};
