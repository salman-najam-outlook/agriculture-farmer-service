'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('report_types', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(()=>{
      return queryInterface.bulkInsert('report_types', [
        {name: 'NDVI', createdAt: new Date(), updatedAt: new Date()},
        {name: 'LSWI', createdAt: new Date(), updatedAt: new Date()},
        {name: 'RECI', createdAt: new Date(), updatedAt: new Date()},
        {name: 'MSAVI', createdAt: new Date(), updatedAt: new Date()},
      ]);
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('report_types');
  }
};