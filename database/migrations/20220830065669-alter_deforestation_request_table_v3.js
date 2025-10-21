'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.addColumn('deforestation_report_requests', 'highProb', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'highProbPercent', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'lowProb', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'lowProbPercent', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'totalArea', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'zeroProb', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    
    await queryInterface.addColumn('deforestation_report_requests', 'zeroProbPercent', {
      type: Sequelize.FLOAT,
      allowNull: true,
    });

    await queryInterface.addColumn('deforestation_report_requests', 'overallProb', {
      type: Sequelize.STRING,
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
