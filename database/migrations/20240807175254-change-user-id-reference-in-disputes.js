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

    await queryInterface.removeConstraint(
      "production_place_disputes",
      "production_place_disputes_ibfk_2"
    );

    await queryInterface.removeConstraint(
      "production_place_dispute_comments",
      "production_place_dispute_comments_ibfk_2"
    );

    await queryInterface.addConstraint("production_place_disputes", {
      fields: ["createdBy"],
      type: "foreign key",
      name: "production_place_disputes_user_id_fkey",
      references: {
        table: "users_dds", // New reference model
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("production_place_dispute_comments", {
      fields: ["commentedBy"],
      type: "foreign key",
      name: "production_place_dispute_comments_user_id_fkey2",
      references: {
        table: "users_dds", // New reference model
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
