'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable('user_metadata', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        ipAddress: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        referer: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        userAgent: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        screenSize: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        timezone: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        lang: {
          allowNull: true,
          type: Sequelize.STRING,
        },
        userId: {
          type: Sequelize.INTEGER,
          references: {
            model: 'users_dds',
            key: 'id'
          },
          allowNull: false
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
        }
      });
    } catch (error) {
      console.log(error, 'err');
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('user_metadata');
  },
};
