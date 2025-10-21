'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable("production_place_dispute_comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      disputeId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'production_place_disputes',
          key: 'id'
        },
        allowNull: false
      },
      commentedBy: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        },
        allowNull: false
      },
      comment: { type: Sequelize.TEXT, allowNull: true },
      s3Key: { type: Sequelize.TEXT, allowNull: true },
      s3Location: { type: Sequelize.TEXT, allowNull: true },
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
    })
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('production_place_dispute_comments');
  }
};
