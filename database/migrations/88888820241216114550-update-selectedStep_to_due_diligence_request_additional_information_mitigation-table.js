'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'due_diligence_request_additional_information',
        'shareAccess',
        {
          type: Sequelize.STRING,
          allowNull: true,
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'due_diligence_request_additional_information',
        'selectedStep',
        {
          type: Sequelize.JSON, 
          allowNull: true,
          defaultValue: [], 
        },
        { transaction }
      );

      await queryInterface.addColumn(
        'due_diligence_request_additional_information',
        'attachAllHighRiskFarms',
        {
          type: Sequelize.BOOLEAN,
          allowNull: true,
          defaultValue: false,
        },
        { transaction }
      );

      const tableDescription = await queryInterface.describeTable('due_diligence_request_additional_information');
      if (tableDescription.userId) {
        await queryInterface.removeColumn('due_diligence_request_additional_information', 'userId', { transaction });
      }
      await queryInterface.addColumn(
        'due_diligence_request_additional_information',
        'userId',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        'due_diligence_request_additional_information',
        {
          fields: ['userId'],
          type: 'foreign key',
          name: 'ddri_userId_fk',
          references: {
            table:'users_dds',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          transaction,
        }
      );

      // Remove and re-add `supplierId` column with correct foreign key
      if (tableDescription.supplierId) {
        await queryInterface.removeColumn('due_diligence_request_additional_information', 'supplierId', { transaction });
      }
      await queryInterface.addColumn(
        'due_diligence_request_additional_information',
        'supplierId',
        {
          type: Sequelize.INTEGER, // Matches `id` column type in `user`
          allowNull: true,
        },
        { transaction }
      );
      await queryInterface.addConstraint(
        'due_diligence_request_additional_information',
        {
          fields: ['supplierId'],
          type: 'foreign key',
          name: 'ddri_supplierId_fk', // Shortened name
          references: {
            table:'users_dds',
            field: 'id',
          },
          onDelete: 'CASCADE',
          onUpdate: 'CASCADE',
          transaction,
        }
      );
      await queryInterface.addColumn(
        'due_diligence_request_additional_information',
        'cfUserid',
        {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        { transaction }
      );
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Remove `shareAccess`, `selectedStep`, `attachAllHighRiskFarms` columns
      await queryInterface.removeColumn('due_diligence_request_additional_information', 'shareAccess', { transaction });
      await queryInterface.removeColumn('due_diligence_request_additional_information', 'selectedStep', { transaction });
      await queryInterface.removeColumn('due_diligence_request_additional_information', 'attachAllHighRiskFarms', { transaction });

      // Remove `userId` column and its constraint
      await queryInterface.removeConstraint(
        'due_diligence_request_additional_information',
        'ddri_userId_fk',
        { transaction }
      );
      await queryInterface.removeColumn(
        'due_diligence_request_additional_information',
        'userId',
        { transaction }
      );

      // Remove `supplierId` column and its constraint
      await queryInterface.removeConstraint(
        'due_diligence_request_additional_information',
        'ddri_supplierId_fk',
        { transaction }
      );
      await queryInterface.removeColumn(
        'due_diligence_request_additional_information',
        'supplierId',
        { transaction }
      );

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
