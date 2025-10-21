'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn('declaration_statements', 'title', {
      type: Sequelize.STRING,
      allowNull: true, 
    });

    await queryInterface.changeColumn('declaration_statements', 'country', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn('declaration_statements', 'description', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.changeColumn('declaration_statements', 'isEnabled', {
      type: Sequelize.BOOLEAN,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
  
  }
};
