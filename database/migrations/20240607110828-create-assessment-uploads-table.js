'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('assessment_uploads', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            assessment_id: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'assessments',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                allowNull: false,
            },
            s3Key: {
                type: Sequelize.STRING,
                allowNull: false
            },
            s3Location: {
                type: Sequelize.STRING,
                allowNull: false
            },
            comment: {
                type: Sequelize.TEXT,
                allowNull: true
            },
            expiry_date: {
                type: Sequelize.DATE,
                allowNull: false
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.NOW
            }
        })
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('assessment_uploads')
    }
};
