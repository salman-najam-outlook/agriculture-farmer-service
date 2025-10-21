'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */ try {
       await queryInterface.createTable('user_farms', {
         id: {
           allowNull: false,
           autoIncrement: true,
           primaryKey: true,
           type: Sequelize.INTEGER,
         },
         userId: { type: Sequelize.INTEGER, allowNull: true },
         farmOwnershipType: {
           type: Sequelize.ENUM(['personal', 'community']),
           allowNull: true,
         },
         communityName: { type: Sequelize.STRING, allowNull: true },
         address: { type: Sequelize.TEXT },
         district: { type: Sequelize.INTEGER, allowNull: true },
         zipCode: { type: Sequelize.STRING, allowNull: true },
         farmName: { type: Sequelize.STRING, allowNull: true },
         registrationNo: { type: Sequelize.STRING, allowNull: true },
         ownerName: { type: Sequelize.STRING, allowNull: true },
         lat: { type: Sequelize.DOUBLE, allowNull: true },
         log: { type: Sequelize.DOUBLE, allowNull: true },
         farmingGoalOptId: { type: Sequelize.INTEGER, allowNull: true },
         farmingActivity: {
           type: Sequelize.ENUM(['crops', 'live stock', 'both']),
           allowNull: true,
         },
         parameter: { type: Sequelize.FLOAT, allowNull: true },
         //  parameterUomId: { type: Sequelize.FLOAT, allowNull: true },
         area: { type: Sequelize.FLOAT, allowNull: true },
         //  areaUomId: { type: Sequelize.FLOAT, allowNull: true },
         isPrimaryFarm: { type: Sequelize.INTEGER, allowNull: true },
         isFarmRegistered: {
           type: Sequelize.TINYINT,
           allowNull: false,
           defaultValue: 0,
         },
         isDeleted: {
           type: Sequelize.TINYINT,
           allowNull: false,
           defaultValue: 0,
         },
         syncId: { type: Sequelize.INTEGER },
         //  farmType: {
         //    type: Sequelize.INTEGER,
         //    allowNull: false,
         //    references: {
         //      model: 'options',
         //      key: 'id',
         //    },
         //  },
         //  productionSystem: {
         //    type: Sequelize.INTEGER,
         //    allowNull: false,
         //    references: {
         //      model: 'options',
         //      key: 'id',
         //    },
         //  },
         //  farmOwner: {
         //    type: Sequelize.INTEGER,
         //    allowNull: false,
         //    references: {
         //      model: 'users',
         //      key: 'id',
         //    },
         //  },
         //  country: { type: Sequelize.STRING, allowNull: true },
         //  state: { type: Sequelize.STRING, allowNull: true },
         //  city: { type: Sequelize.STRING, allowNull: true },
         //  govRegistrationNum: { type: Sequelize.STRING, allowNull: true },
         //  contractMating: { type: Sequelize.STRING, allowNull: true },
         //  cooperativeId: { type: Sequelize.STRING, allowNull: true },
         //  licenceNum: { type: Sequelize.STRING, allowNull: true },
         //  licenceExpiryDate: { type: Sequelize.STRING, allowNull: true },
         //  regulatorName: { type: Sequelize.STRING, allowNull: true },
         //  houseNum: { type: Sequelize.STRING, allowNull: true },
         //  street: { type: Sequelize.STRING, allowNull: true },
         //  regulatorRepresentiveName: { type: Sequelize.STRING, allowNull: true },
         createdAt: {
           allowNull: false,
           type: Sequelize.DATE,
           defaultValue: Sequelize.fn('CURRENT_TIMESTAMP'),
         },
         updatedAt: {
           allowNull: false,
           type: Sequelize.DATE,
           defaultValue: Sequelize.fn(
             'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
           ),
         },
       });
     } catch (error) {
       console.log(error, 'err');
     }
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.dropTable('user_farms');
  },
};
