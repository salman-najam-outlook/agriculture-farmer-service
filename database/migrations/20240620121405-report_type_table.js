'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("reports_type", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    }).then(()=>{
      return queryInterface.bulkInsert('reports_type', [
        {
          name: 'Due Diligence Reports',
          description: 'due diligence reports',
        },
        {
          name: 'EUDR Deforestation Assessments',
          description: 'due diligence report',
        },
        {
          name: 'Risk Assessments',
          description: 'risk assessment',
        },
      ]);
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('reports_type');
  }
};
