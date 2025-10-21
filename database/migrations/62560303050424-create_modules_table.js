"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface
      .createTable("modules", {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.STRING,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      })
      .then(() => {
        return queryInterface.bulkInsert("modules", [
          {
            id: 'admin_dashboard',
            name: 'Admin Dashboard',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'dashboard',
            name: 'Dashboard',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'analytics',
            name: 'Analytics',
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          {
            id: 'my_farms',
            name: 'My farm',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'animals',
            name: 'Animals',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'livestock_goals',
            name: 'Livestock Goals',
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          {
            id: 'my_schedule',
            name: 'Action List',
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          {
            id: 'inventory',
            name: 'Inventory',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'reports',
            name: 'Reports',
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          {
            id: 'pasture_management',
            name: 'Pasture Management',
            createdAt: new Date(),
            updatedAt: new Date(),
          },

          {
            id: 'feed_management',
            name: 'Feed Management',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ]);
      });
  },

  down: async (queryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable("modules");
  },
};
