"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.createTable("users_dds", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      cf_userid: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      firstName: { type: Sequelize.STRING, allowNull: true },
      lastName: { type: Sequelize.STRING, allowNull: true },
      countryCode: { type: Sequelize.STRING, allowNull: true },
      mobile: { type: Sequelize.STRING, allowNull: true },
      email: { type: Sequelize.STRING, allowNull: true },
      unverifiedMobile: { type: Sequelize.STRING, allowNull: true },
      unverifiedEmail: { type: Sequelize.STRING, allowNull: true },
      password: { type: Sequelize.STRING, allowNull: true },
      language: { type: Sequelize.STRING, allowNull: true },
      countryId: { type: Sequelize.STRING, allowNull: true },
      stateId: { type: Sequelize.INTEGER, allowNull: true },
      district: { type: Sequelize.STRING, allowNull: true },
      village: { type: Sequelize.STRING, allowNull: true },
      otp: { type: Sequelize.STRING, allowNull: true },
      businessName: { type: Sequelize.STRING, allowNull: true },
      address: { type: Sequelize.TEXT },
      fax: { type: Sequelize.STRING, allowNull: true },
      website: { type: Sequelize.STRING, allowNull: true },
      localPremiseId: { type: Sequelize.STRING, allowNull: true },
      federalPremiseId: { type: Sequelize.STRING, allowNull: true },
      userType: { type: Sequelize.ENUM(["owner", "breeder"]), allowNull: true },
      registration_type: {
        type: Sequelize.ENUM(["email", "mobile"]),
        allowNull: true,
      },
      pushNotification: { type: Sequelize.INTEGER, allowNull: true },
      notificationSound: { type: Sequelize.INTEGER, allowNull: true },
      isLogin: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      verified: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      active: { type: Sequelize.TINYINT, allowNull: false, defaultValue: 0 },
      profilePicUrl: { type: Sequelize.STRING, allowNull: true },
      profilePicS3Key: { type: Sequelize.STRING, allowNull: true },
      profilePicName: { type: Sequelize.STRING, allowNull: true },
      organization: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "organization",
          key: "id",
        },
      },
      loginAttempts: { type: Sequelize.TEXT },
      lockedToken: { type: Sequelize.TEXT },
      role: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      clientId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      dimitraUserId: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      eori_number:{
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */

    await queryInterface.dropTable("dds_users");
  },
};
