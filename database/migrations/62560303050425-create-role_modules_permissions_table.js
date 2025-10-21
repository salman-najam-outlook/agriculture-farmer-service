'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('role_module_permissions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
        autoIncrement: false
      },
      role: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      module_id: {
        type: Sequelize.STRING,
        references: {
          model: 'modules',
          key: 'id',
        },
        onDelete: "CASCADE",
        allowNull: false,
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
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        ),
      },
    }, {
      uniqueKeys: {
        Items_unique: {
          fields: ['role', 'module_id'],
        },
      },
    }).then(async () => {
      try {
        return await queryInterface.bulkInsert("role_module_permissions", [
          {
            id: "farmer_dashboard",
            role: "farmer",
            module_id: "dashboard",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_analytics",
            role: "farmer",
            module_id: "analytics",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_my_farms",
            role: "farmer",
            module_id: "my_farms",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "admin_dashboard",
            role: "admin",
            module_id: "admin_dashboard",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_animals",
            role: "farmer",
            module_id: "animals",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_livestock_goals",
            role: "farmer",
            module_id: "livestock_goals",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_my_schedule",
            role: "farmer",
            module_id: "my_schedule",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_inventory",
            role: "farmer",
            module_id: "inventory",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_reports",
            role: "farmer",
            module_id: "reports",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_pasture_management",
            role: "farmer",
            module_id: "pasture_management",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "farmer_feed_management",
            role: "farmer",
            module_id: "feed_management",
            createdAt: new Date(),
            updatedAt: new Date(),
          },

        ]);
      }
      catch (e) {
        console.log(e)
      }

    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('user_type_modules');
  }
};
