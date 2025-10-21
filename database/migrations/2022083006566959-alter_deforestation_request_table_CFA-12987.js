'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'mediumProb', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'veryHighProb', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'veryLowProb', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'mediumProbPercent', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'veryHighProbPercent', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'veryLowProbPercent', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
